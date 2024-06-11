import OpenAI from "openai";
import express from 'express';
import cors from 'cors';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import dotenv from 'dotenv';
import ServerlessHttp from "serverless-http";


dotenv.config();
const OPENAI_KEY = process.env.OPEN_AI;

const openai = new OpenAI({
    apiKey: OPENAI_KEY,
});

const app = express();

let corsOptions = {
    origin: 'https://suggestvar.pages.dev',
    credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(cookieParser());

// CSRF protection middleware
const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        secure: true, // HTTPS
        sameSite: 'none' // CORS 요청을 허용
    }
});
app.use(csrfProtection);

// CORS 헤더를 모든 응답에 추가
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://suggestvar.pages.dev');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, CSRF-Token');
    next();
});

app.options('*', (req, res) => {
    // CORS 프리플라이트 요청 처리
    res.header('Access-Control-Allow-Origin', 'https://suggestvar.pages.dev');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, CSRF-Token');
    res.sendStatus(204);
});
app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});


app.post('/suggest', async function(req, res) {
    const { language, type, purpose } = req.body;
    // console.log(language);
    // console.log(type);
    // console.log(purpose);

    const prompt = `
    You are an expert software developer. Your task is to suggest appropriate variable names for the given context. 
    The variable names should be meaningful, concise, and follow best practices for the given programming language.

    Programming Language: ${language}
    Variable Type: ${type}
    Variable Purpose: ${purpose}

    Suggest three variable names for each naming convention: camelCase, PascalCase, and snake_case.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        const suggestions = response.choices[0].message.content;
        // console.log(suggestions);

        const camelCaseNames = suggestions.match(/camelCase:\n(.*?)\n\n/s)[1].split('\n').map(name => name.trim());
        const PascalCaseNames = suggestions.match(/PascalCase:\n(.*?)\n\n/s)[1].split('\n').map(name => name.trim());
        const snakeCaseNames = suggestions.match(/snake_case:\n(.*)/s)[1].split('\n').map(name => name.trim());

        const jsonResponse = {
            camelCase: camelCaseNames.map(name => name.split('. ')[1]),
            PascalCase: PascalCaseNames.map(name => name.split('. ')[1]),
            snake_case: snakeCaseNames.map(name => name.split('. ')[1])
        };

        res.json(jsonResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 로컬에서 서버 실행
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
export const handler = ServerlessHttp(app);
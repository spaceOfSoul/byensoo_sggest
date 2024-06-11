async function getCsrfToken() {
    const response = await fetch('https://6ilwd4fujj2n67ixaq2en5hema0welee.lambda-url.ap-northeast-2.on.aws/csrf-token', {
        method: 'GET',
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.csrfToken;
}

document.querySelector('form').addEventListener('submit', async(event) => {
    event.preventDefault();

    try {
        const csrfToken = await getCsrfToken();
        const type = document.getElementById('type').value;
        const purpose = document.getElementById('purpose').value;

        const response = await fetch('https://6ilwd4fujj2n67ixaq2en5hema0welee.lambda-url.ap-northeast-2.on.aws/suggest', {
            method: 'POST',
            credentials: 'include', // 쿠키를 포함하기 위해 설정
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify({ type, purpose })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        document.getElementById('camelCase1').innerText = result.camelCase[0];
        document.getElementById('camelCase2').innerText = result.camelCase[1];
        document.getElementById('camelCase3').innerText = result.camelCase[2];
        document.getElementById('PascalCase1').innerText = result.PascalCase[0];
        document.getElementById('PascalCase2').innerText = result.PascalCase[1];
        document.getElementById('PascalCase3').innerText = result.PascalCase[2];
        document.getElementById('snake_case1').innerText = result.snake_case[0];
        document.getElementById('snake_case2').innerText = result.snake_case[1];
        document.getElementById('snake_case3').innerText = result.snake_case[2];
    } catch (error) {
        console.error('Error:', error);
    }
});


document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const target = document.getElementById(targetId);
        navigator.clipboard.writeText(target.innerText).then(() => {
            alert('클립보드에 저장되었습니다.');
        });
    });
});
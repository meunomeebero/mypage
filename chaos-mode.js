(function() {
    // Arrays de conteúdo bizarro
    const creepyGifs = [
        'https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif', // blinking eyes
        'https://media.giphy.com/media/xT9IgvEOwRzUcZDRiU/giphy.gif', // Glitch face
        'https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif', // TV static
        'https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif', // Creepy smile
        'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Weird dance
        'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', // Mind blown
        'https://media.giphy.com/media/5ftsmLIqktHQA/giphy.gif', // Crazy eyes
        'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', // Surprised
        'https://media.giphy.com/media/xT0GqgeTVaAdWZD1uw/giphy.gif', // Rainbow puke
        'https://media.giphy.com/media/3ohhwfAa9rbXaZe86c/giphy.gif', // Trippy
        'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif', // Weird cat
        'https://media.giphy.com/media/VIOkcgpsnA2Zy/giphy.gif', // Dancing skeleton
        'https://media.giphy.com/media/26ufcVAp3AiJJsrIs/giphy.gif', // Weird animation
        'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif', // Distorted
        'https://media.giphy.com/media/l3q2zVr6cu95nF6O4/giphy.gif' // Psychedelic
    ];

    const memeTexts = [
        'VOCÊ FOI HACKEADO!!! 😈',
        'VIRUS DETECTADO!!! 🦠',
        'SEU COMPUTADOR FOI INVADIDO! 💀',
        'BERO ESTÁ NO SEU PC! 👁️',
        'NÃO ERA PRA CLICAR AQUI! 🚫',
        'TARDE DEMAIS! ⏰',
        'BEM-VINDO AO CAOS! 🌀',
        'VOCÊ ATIVOU O MODO SECRETO! 🔓',
        'ERROR 404: SANIDADE NÃO ENCONTRADA! 🤪',
        'PARABÉNS, VOCÊ GANHOU UM VÍRUS! 🎉',
        'DELETE SYSTEM32? Y/N 💾',
        'FORMATANDO C:\\ ... 💿',
        'ENVIANDO FOTOS PARA A NASA... 🚀',
        'BAIXANDO 1000TB DE RAM... 💻',
        'INSTALANDO BONZI BUDDY 2.0... 🦍'
    ];

    const sounds = [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCiuCx/LTezMGHm7A7OigUhELOZjZ8cNyOwEQWrLj66RWGAw7msryxnkeBjuY1/LIeSsFKILO8tyKOQcZaLvs56hSEww'
    ];

    let popupCount = 0;
    let maxPopups = 50;
    let chaosInterval;
    let glitchInterval;
    let audioElements = [];

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-10px, -10px) rotate(-5deg); }
            20% { transform: translate(10px, -10px) rotate(5deg); }
            30% { transform: translate(-10px, 10px) rotate(-5deg); }
            40% { transform: translate(10px, 10px) rotate(5deg); }
            50% { transform: translate(-10px, -10px) rotate(-5deg); }
            60% { transform: translate(10px, -10px) rotate(5deg); }
            70% { transform: translate(-10px, 10px) rotate(-5deg); }
            80% { transform: translate(10px, 10px) rotate(5deg); }
            90% { transform: translate(-10px, -10px) rotate(-5deg); }
        }

        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }

        @keyframes glitch {
            0%, 100% { 
                clip-path: inset(0 0 0 0);
                transform: translate(0);
            }
            20% {
                clip-path: inset(100% 0 0 0);
                transform: translate(-5px);
            }
            40% {
                clip-path: inset(0 0 100% 0);
                transform: translate(5px);
            }
            60% {
                clip-path: inset(0 100% 0 0);
                transform: translate(-5px);
            }
            80% {
                clip-path: inset(0 0 0 100%);
                transform: translate(5px);
            }
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-50px); }
        }

        .chaos-popup {
            position: fixed;
            z-index: 999999;
            background: white;
            border: 3px solid red;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 0 50px rgba(255, 0, 0, 0.8);
            animation: shake 0.5s infinite;
            cursor: none !important;
        }

        .chaos-gif {
            max-width: 300px;
            max-height: 300px;
            display: block;
        }

        .chaos-text {
            font-size: 24px;
            font-weight: bold;
            color: red;
            text-align: center;
            margin: 10px 0;
            font-family: 'Comic Sans MS', cursive;
            animation: rainbow 2s linear infinite;
        }

        .bonzi-buddy {
            position: fixed;
            width: 150px;
            height: 150px;
            z-index: 999998;
            animation: bounce 2s ease-in-out infinite;
            cursor: none !important;
        }

        .bonzi-buddy img {
            width: 100%;
            height: 100%;
            animation: spin 4s linear infinite;
        }

        .glitch-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 999997;
            background: repeating-linear-gradient(
                0deg,
                rgba(255, 0, 0, 0.1),
                rgba(255, 0, 0, 0.1) 2px,
                transparent 2px,
                transparent 4px
            );
            animation: glitch 0.3s infinite;
        }

        body.chaos-mode {
            animation: rainbow 1s linear infinite, shake 0.1s infinite;
            overflow: visible !important;
        }

        .matrix-rain {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999996;
            color: #0F0;
            font-family: monospace;
            font-size: 20px;
            overflow: hidden;
        }

        .matrix-column {
            position: absolute;
            top: -100%;
            animation: matrix-fall linear infinite;
        }

        @keyframes matrix-fall {
            to { top: 100%; }
        }

        .chaos-close {
            position: absolute;
            top: 5px;
            right: 5px;
            background: red;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            font-weight: bold;
            animation: rainbow 1s linear infinite;
        }

        .chaos-close:hover {
            background: black;
        }
    `;
    document.head.appendChild(style);

    function createPopup() {
        if (popupCount >= maxPopups) return;

        const popup = document.createElement('div');
        popup.className = 'chaos-popup';
        popup.style.left = Math.random() * (window.innerWidth - 350) + 'px';
        popup.style.top = Math.random() * (window.innerHeight - 350) + 'px';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'chaos-close';
        closeBtn.textContent = 'X';
        closeBtn.onclick = function() {
            popup.remove();
            popupCount--;
            setTimeout(() => {
                createPopup();
                createPopup();
            }, 100);
        };

        const gif = document.createElement('img');
        gif.className = 'chaos-gif';
        gif.src = creepyGifs[Math.floor(Math.random() * creepyGifs.length)];

        const text = document.createElement('div');
        text.className = 'chaos-text';
        text.textContent = memeTexts[Math.floor(Math.random() * memeTexts.length)];

        popup.appendChild(closeBtn);
        popup.appendChild(text);
        popup.appendChild(gif);

        document.body.appendChild(popup);
        popupCount++;

        setInterval(() => {
            if (popup.parentElement) {
                popup.style.left = Math.random() * (window.innerWidth - 350) + 'px';
                popup.style.top = Math.random() * (window.innerHeight - 350) + 'px';
            }
        }, 2000);
    }

    function createBonziBuddy() {
        const bonzi = document.createElement('div');
        bonzi.className = 'bonzi-buddy';
        bonzi.style.left = Math.random() * (window.innerWidth - 150) + 'px';
        bonzi.style.top = Math.random() * (window.innerHeight - 150) + 'px';

        const img = document.createElement('img');
        img.src = 'https://media.giphy.com/media/l3q2zVr6cu95nF6O4/giphy.gif';
        
        bonzi.appendChild(img);
        document.body.appendChild(bonzi);

        // Movimento aleatório
        setInterval(() => {
            if (bonzi.parentElement) {
                const newX = Math.random() * (window.innerWidth - 150);
                const newY = Math.random() * (window.innerHeight - 150);
                bonzi.style.transition = 'all 2s ease-in-out';
                bonzi.style.left = newX + 'px';
                bonzi.style.top = newY + 'px';
            }
        }, 3000);
    }

    function createMatrixRain() {
        const matrix = document.createElement('div');
        matrix.className = 'matrix-rain';

        for (let i = 0; i < 50; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.left = Math.random() * 100 + '%';
            column.style.animationDuration = (Math.random() * 5 + 5) + 's';
            column.style.animationDelay = Math.random() * 5 + 's';
            
            const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
            let text = '';
            for (let j = 0; j < 20; j++) {
                text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
            }
            column.innerHTML = text;
            
            matrix.appendChild(column);
        }

        document.body.appendChild(matrix);
    }

    function createGlitchOverlay() {
        const glitch = document.createElement('div');
        glitch.className = 'glitch-overlay';
        document.body.appendChild(glitch);

        setInterval(() => {
            glitch.style.opacity = Math.random();
            glitch.style.mixBlendMode = Math.random() > 0.5 ? 'difference' : 'multiply';
        }, 100);
    }

    function playRandomSound() {
        const audio = new Audio('public/pru.mp3');
        audio.volume = 0.3;
        audio.playbackRate = Math.random() * 2 + 0.5;
        audio.play().catch(() => {});
        audioElements.push(audio);
    }

    function createFakeAlert() {
        const messages = [
            'Windows detectou um problema e precisa reiniciar',
            'Erro crítico no sistema!',
            'Memória RAM excedida!',
            'CPU em 420% de uso!',
            'Temperatura do processador: 9000°C',
            'Vírus.exe instalado com sucesso!'
        ];

        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff0000, #ff00ff, #00ffff, #ffff00);
            background-size: 400% 400%;
            animation: rainbow 2s ease infinite;
            padding: 30px;
            border: 5px solid black;
            z-index: 1000000;
            font-size: 30px;
            font-family: 'Comic Sans MS';
            color: white;
            text-shadow: 2px 2px 4px black;
            border-radius: 20px;
            box-shadow: 0 0 100px rgba(255, 0, 0, 0.8);
        `;
        alertDiv.textContent = messages[Math.floor(Math.random() * messages.length)];
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    function initChaos() {
        const audio = new Audio('public/undertale.mp3');
        audio.loop = true
        audio.play();

        window.scrollTo({ top: 0, behavior: "smooth" });
        document.body.classList.add('chaos-mode');

        createMatrixRain();

        createGlitchOverlay();

        let delay = 100;
        for (let i = 0; i < 10; i++) {
            setTimeout(createPopup, delay);
            delay += 200;
        }

        for (let i = 0; i < 5; i++) {
            setTimeout(createBonziBuddy, i * 1000);
        }

        chaosInterval = setInterval(() => {
            createPopup();
            if (Math.random() > 0.7) createBonziBuddy();
            if (Math.random() > 0.8) createFakeAlert();
            if (Math.random() > 0.6) playRandomSound();
        }, 1500);

        glitchInterval = setInterval(() => {
            const hue = Math.random() * 360;
            document.body.style.filter = `hue-rotate(${hue}deg) contrast(${Math.random() + 0.5}) brightness(${Math.random() + 0.5})`;
        }, 500);

        setInterval(() => {
            if (Math.random() > 0.9) {
                document.body.style.transform = `rotate(${Math.random() * 10 - 5}deg) scale(${Math.random() * 0.3 + 0.85})`;
                setTimeout(() => {
                    document.body.style.transform = '';
                }, 1000);
            }
        }, 3000);

        setInterval(() => {
            const floatingText = document.createElement('div');
            floatingText.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                font-size: ${Math.random() * 50 + 20}px;
                color: rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255});
                z-index: 999999;
                pointer-events: none;
                animation: spin 2s linear infinite, bounce 1s ease-in-out infinite;
                font-family: 'Comic Sans MS';
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            `;
            floatingText.textContent = ['BERO', 'HACKED', 'LOL', '420', '69', 'NICE', 'VIRUS', 'ERROR', '!!!'][Math.floor(Math.random() * 9)];
            document.body.appendChild(floatingText);

            setTimeout(() => {
                floatingText.remove();
            }, 5000);
        }, 800);

        document.body.style.cursor = 'url(https://media.giphy.com/media/3o7TKB3oifq46DDhOE/giphy.gif), auto';

        console.log('%c VOCÊ FOI HACKEADO PELO BERO!!! ', 'background: red; color: yellow; font-size: 50px; font-weight: bold;');
        console.log('%c 🎉🎉🎉 PARABÉNS! VOCÊ ENCONTROU O EASTER EGG! 🎉🎉🎉', 'background: linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet); color: white; font-size: 20px; padding: 10px;');

        setTimeout(() => {
            const stopButton = document.createElement('button');
            stopButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 20px 40px;
                font-size: 24px;
                background: red;
                color: white;
                border: 3px solid black;
                cursor: pointer;
                z-index: 1000001;
                animation: shake 0.5s infinite, rainbow 1s linear infinite;
                font-family: 'Comic Sans MS';
                font-weight: bold;
                border-radius: 10px;
            `;
            stopButton.textContent = 'PARAR O CAOS! 🛑';
            stopButton.onclick = function() {
                alert('HAHAHA! ACHOU QUE IA PARAR? 😈');
                maxPopups += 20;
                for (let i = 0; i < 10; i++) {
                    createPopup();
                    createBonziBuddy();
                }
                stopButton.textContent = 'DESISTO! 😭';
                stopButton.style.fontSize = '30px';
                stopButton.style.animation = 'shake 0.1s infinite, spin 0.5s linear infinite';
            };
            document.body.appendChild(stopButton);
        }, 5000);
    }

    initChaos();

    window.onbeforeunload = function() {
        return "Você tem certeza que quer sair? O Bero vai ficar triste! 😢";
    };

})();
const elements = {
    sun: '☀️',      // Sol
    water: '💧',    // Água
    earth: '🌍',    // Terra
    air: '🌬️'      // Ar
};

const combinations = {
    'sun+water': 'Fotossíntese 🌿',
    'earth+water': 'Mangue 🌱',
    'sun+earth': 'Ciclo do Carbono ♻️',
    'water+air': 'Chuva 🌧️',
    'sun+air': 'Vento Solar 💨',
    'air+earth': 'Erosão 🌪️',
    'earth+plant': 'Floresta 🌲'
};

const badCombinations = {
    'earth+fire': 'Queimada 🔥',
    'water+earth': 'Deslizamento de Terra 🌧️',
    'pollution+water': 'Contaminação 🌫️',
    'erosion+deforestation': 'Desertificação 🏜️'
};



let createdElements = new Set();
let firstElement = null;
let movingElement = null;
let timer = 30;
let score = 0;
let interval;
let draggedElements = []; // Armazena os elementos soltos
let isPaused = false;
// Elementos DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const playerNameInput = document.getElementById('player-name');
const timerElement = document.getElementById('time-left');
const scoreElement = document.getElementById('player-score');
const finalScoreElement = document.getElementById('final-score');
const resultDiv = document.getElementById('result');
const dropZone = document.getElementById('drop-zone');
const createdElementsList = document.getElementById('created-elements');
const highScoresList = document.getElementById('high-scores-list'); // Lista de placares

// Função para iniciar o jogo
function startGame() {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        const highScores = getHighScores();
        const playerExists = highScores.some(scoreEntry => scoreEntry.player === playerName);

        if (playerExists) {
            alert('Nome de usuário já está em uso. Escolha outro nome.');
            return;
        }

        sessionStorage.setItem('currentPlayer', playerName);
        sessionStorage.setItem('currentScore', score);
        sessionStorage.setItem('highScores', JSON.stringify(getHighScores()));

        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        startTimer();
    } else {
        alert('Por favor, insira seu nome.');
    }
}

function startTimer() {
    interval = setInterval(() => {
        timer--;
        timerElement.textContent = timer;

        if (timer <= 0) {
            endGame();
        }
    }, 1000);
}


// Função para adicionar tempo ao cronômetro
function addTime() {
    timer += 3;
}

// Função para aumentar a pontuação
function increaseScore() {
    score++;
    scoreElement.textContent = score;
    sessionStorage.setItem('currentScore', score);
}

// Função para encerrar o jogo e mostrar a tela de fim
function endGame() {
    clearInterval(interval);
    finalScoreElement.textContent = `Sua pontuação final: ${score}`;
    saveHighScore(sessionStorage.getItem('currentPlayer'), score);
    updateHighScoresList(); // Atualiza o ranking
    gameScreen.style.display = 'none';
    endScreen.style.display = 'block';
    
    // Adicionar cor de fundo com base no nome do jogador
    const currentPlayer = sessionStorage.getItem('currentPlayer');
    endScreen.style.backgroundColor = getColorForPlayer(currentPlayer);
    if (currentPlayer) {
        finalScoreElement.style.color = 'green';
    } else {
        finalScoreElement.style.color = 'black'; // Cor padrão caso não haja jogador
    }
}

// Função para obter a cor de fundo com base no nome do jogador
function getColorForPlayer(playerName) {
    // Adapte esta função para fornecer cores diferentes conforme necessário
    const colors = {
        'Gladson': '#FFDDC1',
        'Gustavo': '#C1E1C1'
    };

    return colors[playerName] || '#FFFFFF'; // Cor padrão se o jogador não tiver cor definida
}

// Função para atualizar a lista de placares
function updateHighScoresList() {
    highScoresList.innerHTML = ''; // Limpa a lista existente

    const highScores = getHighScores();
    const currentPlayer = sessionStorage.getItem('currentPlayer');

    if (highScores.length === 0) {
        highScoresList.innerHTML = '<li>Nenhum placar registrado ainda.</li>';
        return;
    }

    highScores.forEach(scoreEntry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${scoreEntry.player}: ${scoreEntry.score}`;
        
        // Destacar o nome do usuário logado
        if (scoreEntry.player === currentPlayer) {
            listItem.style.color = 'green';
        } else {
            listItem.style.color = 'black';
        }

        highScoresList.appendChild(listItem);
    });
}


// Função para salvar a pontuação no ranking
// Função para salvar a pontuação no ranking
function saveHighScore(player, score) {
    const highScores = getHighScores();
    const playerIndex = highScores.findIndex(scoreEntry => scoreEntry.player === player);

    if (playerIndex !== -1) {
        // Se o jogador já existe, atualize a pontuação se for maior
        if (highScores[playerIndex].score < score) {
            highScores[playerIndex].score = score;
        }
    } else {
        // Se o jogador não existe, adicione uma nova entrada
        highScores.push({ player, score });
    }

    highScores.sort((a, b) => b.score - a.score);
    sessionStorage.setItem('highScores', JSON.stringify(highScores));
}

// Função para obter as pontuações mais altas
function getHighScores() {
    return JSON.parse(sessionStorage.getItem('highScores')) || [];
}

// Função para reiniciar o jogo
function restartGame() {
    score = 0;
    timer = 30;
    createdElements = new Set(); // Reseta os elementos criados
    draggedElements = []; // Reseta a lista de elementos arrastados
    scoreElement.textContent = score;
    timerElement.textContent = timer;
    createdElementsList.innerHTML = ''; // Limpa a lista de elementos criados
    removeAllDropZoneElements(); // Remove todos os elementos do drop zone
    endScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    startTimer();
}

// Funções para arrastar e combinar os elementos
function handleTouchStart(event) {
    const touch = event.touches[0];
    movingElement = event.target;
    movingElement.style.position = 'absolute';
    movingElement.style.left = `${touch.pageX - movingElement.offsetWidth / 2}px`;
    movingElement.style.top = `${touch.pageY - movingElement.offsetHeight / 2}px`;

    // Adicionar o elemento à lista de elementos arrastados
    if (!draggedElements.includes(movingElement)) {
        draggedElements.push(movingElement);
        if (draggedElements.length > 2) {
            // Remover o elemento mais antigo da lista e devolvê-lo à posição original
            const elementToReturn = draggedElements.shift();
            resetElementPosition(elementToReturn);
        }
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];

    if (movingElement) {
        movingElement.style.left = `${touch.pageX - movingElement.offsetWidth / 2}px`;
        movingElement.style.top = `${touch.pageY - movingElement.offsetHeight / 2}px`;
    }
}

function handleTouchEnd(event) {
    if (movingElement && isInDropZone(movingElement)) {
        if (!firstElement) {
            firstElement = movingElement.getAttribute('data-element');
            resultDiv.textContent = `Primeiro elemento: ${firstElement}`;
        } else {
            const secondElement = movingElement.getAttribute('data-element');
            const result = combineElements(firstElement, secondElement);

            if (result && !createdElements.has(result)) {
                createNewElement(result);
                createdElements.add(result);
                addTime();
                increaseScore();
            } else if (createdElements.has(result)) {
                resultDiv.textContent = `${result} já foi criado!`;
            }

            firstElement = null; // Reiniciar após combinação
        }
    } else if (movingElement) {
        // Se o elemento não estiver na área de "drop", devolvê-lo à posição original
        resetElementPosition(movingElement);
    }
    movingElement = null;
}




function combineElements(element1, element2) {
    const combination = `${element1}+${element2}`;
    const reverseCombination = `${element2}+${element1}`;

    let result = null;
console.log(combination, reverseCombination)
    // Verifica se a combinação é uma combinação boa ou ruim
    if (combinations[combination]) {
        result = combinations[combination];
    } else if (combinations[reverseCombination]) {
        result = combinations[reverseCombination];
    } else if (badCombinations[combination]) {
        result = badCombinations[combination];
    } else if (badCombinations[reverseCombination]) {
        result = badCombinations[reverseCombination];
    }
     console.log(combinations, badCombinations, combination);
    // Agora tratamos o resultado
    if (result && !createdElements.has(result)) {
        createdElements.add(result);
        createNewElement(result);

        // Se for uma combinação ruim, subtrai tempo e mostra modal para combinação ruim
        if (badCombinations[combination] || badCombinations[reverseCombination]) {
            subtractTime();
            showModal(result, true);  // Mostrar modal explicando por que o elemento é ruim
        } else {
            // Se for uma boa combinação, adiciona tempo e mostra modal para boa combinação
            addTime();
            showModal(result, false);  // Mostrar modal explicando sobre o novo elemento
        }

        increaseScore();  // Aumenta pontuação após criar novo elemento
    } else if (createdElements.has(result)) {
        resultDiv.textContent = `${result} já foi criado!`;
    } else {
        resultDiv.textContent = 'Nenhuma combinação válida!';
    }

    firstElement = null; // Reiniciar após combinação
}


// Função para criar um novo elemento visualmente
function createNewElement(content) {
    const newElement = document.createElement('div');
    newElement.classList.add('element');
    newElement.setAttribute('data-element', content);
    newElement.textContent = content;

    newElement.style.position = 'absolute';
    newElement.style.left = `${Math.random() * (dropZone.offsetWidth - 50)}px`;
    newElement.style.top = `${Math.random() * (dropZone.offsetHeight - 50)}px`;

    newElement.addEventListener('touchstart', handleTouchStart);
    newElement.addEventListener('touchmove', handleTouchMove);
    newElement.addEventListener('touchend', handleTouchEnd);

    dropZone.appendChild(newElement);
    addToCreatedElementsList(content);
}

// Adiciona o novo elemento à lista de elementos criados
function addToCreatedElementsList(content) {
    const listItem = document.createElement('li');
    listItem.textContent = content;
    createdElementsList.appendChild(listItem);
}

// Verifica se o elemento está na área de "drop"
function isInDropZone(element) {
    const dropZoneRect = dropZone.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return (
        elementRect.left < dropZoneRect.right &&
        elementRect.right > dropZoneRect.left &&
        elementRect.top < dropZoneRect.bottom &&
        elementRect.bottom > dropZoneRect.top
    );
}

// Função para remover todos os elementos do drop zone
function removeAllDropZoneElements() {
    while (dropZone.firstChild) {
        dropZone.removeChild(dropZone.firstChild);
    }
}

// Função para pausar o temporizador
function pauseTimer() {
    if (!isPaused) {
        clearInterval(interval); // Pausar o temporizador
        isPaused = true;
    }
}
function resumeTimer() {
    if (isPaused) {
        startTimer(); // Retomar o temporizador
        isPaused = false;
    }
}
// Função para resetar a posição de um elemento
function resetElementPosition(element) {
    element.style.position = 'relative';
    element.style.left = 'auto';
    element.style.top = 'auto';
    element.classList.remove('dragging'); // Opcional: Remover classe de arrasto
    draggedElements = draggedElements.filter(el => el !== element);
}

// Função para lidar com o logout
function handleLogout() {
    // Limpar o estado do jogo e os dados da sessão
    sessionStorage.removeItem('currentPlayer');
    sessionStorage.removeItem('currentScore');

    // Resetar o jogo e mostrar a tela de início
    score = 0;
    timer = 30;
    createdElements = new Set(); // Reseta os elementos criados
    draggedElements = []; // Reseta a lista de elementos arrastados
    scoreElement.textContent = score;
    timerElement.textContent = timer;
    createdElementsList.innerHTML = ''; // Limpa a lista de elementos criados
    removeAllDropZoneElements(); // Remove todos os elementos do drop zone
    
    startScreen.style.display = 'block';
    endScreen.style.display = 'none';
}

// Adicionar eventos aos elementos iniciais
document.querySelectorAll('.element').forEach(element => {
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
});

function subtractTime() {
    timer -= 3;
}
function showModal(element, isBadElement) {
    // Definir o título e o conteúdo do modal
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (isBadElement) {
        modalTitle.textContent = `Elemento Ruim Criado: ${element}`;
        modalBody.innerHTML = `<p>Esse elemento é prejudicial e resultou em uma penalidade de tempo!</p>`;
        document.querySelector('.modal-content').style.backgroundColor = '#f8d7da'; // Cor de fundo vermelha
    } else {
        modalTitle.textContent = `Novo Elemento Criado: ${element}`;
        modalBody.innerHTML = `<p>Você descobriu um novo elemento. Bom trabalho!</p>`;
        document.querySelector('.modal-content').style.backgroundColor = '#d4edda'; // Cor de fundo verde
    }

    // Pausar o cronômetro enquanto o modal estiver aberto
    pauseTimer();

    // Mostrar o modal com o Bootstrap
    $('#elementModal').modal('show');

    // Adicionar um listener para retomar o temporizador quando o modal for fechado
    $('#elementModal').on('hidden.bs.modal', function () {
        resumeTimer();
    });
}

// Adicionar eventos de clique aos botões
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('restart-game').addEventListener('click', restartGame);
document.getElementById('logout').addEventListener('click', handleLogout);

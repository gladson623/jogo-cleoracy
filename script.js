const elements = {
    sun: { name: 'sun', icon: '☀️' },      // Sol
    water: { name: 'water', icon: '💧' },    // Água
    earth: { name: 'earth', icon: '🌍' },    // Terra
    air: { name: 'air', icon: '🌬️' }       // Ar
};

const combinations = {
    'sun+water': { name: 'Vapor', icon: '☁️' },
    'earth+air': { name: 'Poeira', icon: '🌪️' },
    'sun+air': { name: 'Energia', icon: '⚡' },
    'water+earth': { name: 'Lama', icon: '🌿' },
    'sun+earth': { name: 'Lava', icon: '🌋' },
    'water+air': { name: 'Tempestade', icon: '⛈️' },
    'air+water': { name: 'Gelo', icon: '❄️' },
    'air+sun': { name: 'Fumaça', icon: '💨' },
    'lava+water': { name: 'Pedra', icon: '🪨' },
    'sun+poeira': { name: 'Cinzas', icon: '🌫️' },
    'water+lava': { name: 'Obsidiana', icon: '🖤' },
    'air+lama': { name: 'Pântano', icon: '🐸' },
    'sun+vapor': { name: 'Onda de Calor', icon: '🔥' },
    'water+energia': { name: 'Elétrico', icon: '⚡💧' },
    'earth+vapor': { name: 'Gêiser', icon: '🌋' },
    'air+tempestade': { name: 'Tornado', icon: '🌪️' },
    'sun+gelo': { name: 'Fogo Gélido', icon: '🔥❄️' },
    'water+obsidiana': { name: 'Cristal', icon: '💎' },
    'air+obsidiana': { name: 'Fragmento', icon: '🌌' },
    'earth+lava': { name: 'Vulcão', icon: '🌋' },
    'lama+vapor': { name: 'Termas', icon: '🌊' },
    'poeira+lava': { name: 'Rocha Derretida', icon: '🌑' },
    'vapor+lava': { name: 'Plasma', icon: '🌩️' },
    'air+pântano': { name: 'Miasma', icon: '💀' },
    'earth+cristal': { name: 'Pedra Preciosa', icon: '💎' },
    'sun+obsidiana': { name: 'Obsidiana Derretida', icon: '🖤🔥' },
    'water+fragmento': { name: 'Cristal de Gelo', icon: '❄️💎' },
    'sun+gêiser': { name: 'Fonte de Magma', icon: '🔥🌋' },
    'water+tornado': { name: 'Furacão', icon: '🌪️💧' },
    'air+gêiser': { name: 'Jato de Vapor', icon: '🌫️' }
};

const badCombinations = {
    'earth+fire': { name: 'Queimada', icon: '🔥' },
    'water+earth': { name: 'Deslizamento de Terra', icon: '🌧️' },
    'pollution+water': { name: 'Contaminação', icon: '🌫️' },
    'erosion+deforestation': { name: 'Desertificação', icon: '🏜️' }
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
        
            if(playerName == 'comando:limparcache'){
                sessionStorage.clear()
                alert('Comando executado com sucesso');
                return
            }
        
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
        pauseTimer()
        showModal('Instruções do Jogo', false)
        $('#elementModal').modal('show')
    } else {
        alert('Por favor, insira seu nome.');
    }
}

function startTimer() {
    interval = setInterval(() => {
        timer--
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
     console.log(JSON.stringify(createdElements))
    // Agora tratamos o resultado
    if (result && !createdElements.has(result)) {
        createdElements.add(result);
        result = result.name +' '+ result.icon;
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
        resultDiv.textContent = `${result.name +' '+ result.icon} já foi criado!`;
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
function showModal(content, isBadElement) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (content === 'Instruções do Jogo') {
        modalTitle.textContent = 'Instruções do Jogo';
        modalBody.innerHTML = `
            <p>Bem-vindo ao Jogo de Combinações! Este jogo tem como intuito ensinar sobre o impacto de nossas ações no mundo.</p>
            <p>O tempo de vida do mundo está representado pelo cronômetro. Ao criar algo bom, o tempo aumenta em 3 segundos. Ao criar algo ruim, o tempo diminui em 3 segundos.</p>
        `;
        document.querySelector('.modal-content').style.backgroundColor = '#fff'; // Cor padrão
    } else {
        if (isBadElement) {
            modalTitle.textContent = `Elemento Ruim Criado: ${content}`;
            modalBody.innerHTML = `<p>Esse elemento é prejudicial e resultou em uma penalidade de tempo!</p>`;
            document.querySelector('.modal-content').style.backgroundColor = '#f8d7da'; // Cor vermelha
        } else {
            modalTitle.textContent = `Novo Elemento Criado: ${content}`;
            modalBody.innerHTML = `<p>Você descobriu um novo elemento. Bom trabalho!</p>`;
            document.querySelector('.modal-content').style.backgroundColor = '#d4edda'; // Cor verde
        }
    }

    pauseTimer();

    $('#elementModal').modal('show');

    $('#elementModal').on('hidden.bs.modal', function () {
        resumeTimer(); // Retoma o temporizador quando o modal é fechado
    });
}


// Adicionar eventos de clique aos botões
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('restart-game').addEventListener('click', restartGame);
document.getElementById('logout').addEventListener('click', handleLogout);

//Wait for the DOM to finish loading before running the game
document.addEventListener("DOMContentLoaded", function() {

    /**
    * Declare constants for DOM elements and possible choices
    */
    const playerGesture = document.getElementById("player-gesture");
    const compGesture = document.getElementById("comp-gesture");
    const playerScore = document.getElementById("player-score");
    const compScore = document.getElementById("comp-score");
    const choicesBtns = document.getElementsByClassName("choices-btn")
    const choices = ["rock", "paper", "scissors", "lizard", "spock"];
    const playBtn = document.getElementById("play-btn");

    // Game State
    let gameActive = false;
    let playerPoints = 0;
    let compPoints = 0;

    // Index-based rule system
    const rules = {
        0: [2, 3], // Rock beats Scissors and Lizard
        1: [0, 4], // Paper beats Rock and Spock
        2: [1, 3], // Scissors beats Paper and Lizard
        3: [1, 4], // Lizard beats Paper and Spock
        4: [0, 2], // Spock beats Rock and Scissors
    };

    // Add event listener to all gesture buttons
    for (let choicesBtn of choicesBtns) {
        choicesBtn.addEventListener("click", function() {
            if (!gameActive) return;
            let playerChoice = this.getAttribute("data-choice");
            playGame(playerChoice);
        });
    } 

    // Event listener for PLAY NOW button
    playBtn.addEventListener("click", function () {
        runGame();
    });

    // Starts the round
    function runGame() {
        if (gameActive) return;
        gameActive = true;
        resetGesture();
        enableChoiceBtns(true);
    }

    // End the round
    function endGame() {
        gameActive = false;
        enableChoiceBtns(false);
    }

    // Returns a random gesture
    function randomChoice() {
        return Math.floor(Math.random() * choices.length);
    }

    // Called up when the player selects a gesture
    function playGame (playerChoice) {
        const compChoice = randomChoice();

        const playerMove = choices[playerChoice];
        const compMove = choices[compChoice];

        playerGesture.src = `assets/images/${playerMove}.webp`;
        compGesture.src = `assets/images/${compMove}.webp`;

        const winner = determineWinner(playerChoice, compChoice);
        updateScore(winner);
        endGame();
    }

    // Compare gestures and pick the winner
    function determineWinner(playerChoice, compChoice) {
        if (playerChoice === compChoice) return "draw";
        if (rules[playerChoice].includes(compChoice)) return "player";
        return "comp";
    }

    // Increment the score of the player or the Computer, depending on who wins
    function updateScore(winner) {
        if (winner === "player") {
            playerPoints++;
        } else if (winner === "comp") {
            compPoints++;
        }

        playerScore.textContent = "Player: " + playerPoints;
        compScore.textContent = "Comp: " + compPoints;
    }

    // Reset gesture back to rock
    function resetGesture() {
        playerGesture.src = "assets/images/rock.webp";
        compGesture.src = "assets/images/rock.webp";
    }

    // Enables or disables all gesture buttons
    function enableChoiceBtns(enabled) {
        for (let choicesBtn of choicesBtns) {
            choicesBtn.disabled = !enabled;
            choicesBtn.classList.toggle("disable-btn", !enabled);
        }
    }
});
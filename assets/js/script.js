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

    // Add event listener to all gesture buttons
    for (let choicesBtn of choicesBtns) {
        choicesBtn.addEventListener("click", function() {
            let playerChoice = this.getAttribute("data-choice");
            playGame(playerChoice);
        });
    } 

    // Starts the round
    function runGame() {
    }

    // End the round
    function endGame() {

    }

    // Returns a random gesture
    function randomChoice() {

    }

    // Called up when the player selects a gesture
    function playerChoice() {

    }

    // Compare gestures and pick the winner
    function determineWinner() {

    }

    // Increment the score of the player or the Computer, depending on who wins
    function updateScore() {

    }

    // Reset gesture back to rock
    function resetGesture() {

    }
})
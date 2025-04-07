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
    const winningScore = 3;

    // Game State
    let gameActive = false;
    let playerPoints = 0;
    let compPoints = 0;

    // Timer
    let countdown = 5;
    let timerInterval = null;
    let playerHasChosen = false;

    /**
     * Object defining the winning relationships between gestures using indexes
     * Each key beats the listed values
     */
    const rules = {
        0: [2, 3], // Rock beats Scissors and Lizard
        1: [0, 4], // Paper beats Rock and Spock
        2: [1, 3], // Scissors beats Paper and Lizard
        3: [1, 4], // Lizard beats Paper and Spock
        4: [0, 2], // Spock beats Rock and Scissors
    };

    /**
     * Object mapping gesture win interactions to desciptive verbs
     */
    const messages = {
        0: { 2: "crushes", 3: "crushes"},
        1: { 0: "covers", 4: "disproves"},
        2: { 1: "cuts", 3: "decapitates"},
        3: { 1: "poisons", 4: "eats"},
        4: { 0: "vaporizes", 2: "smashes" }
    };

    /**
     * Adds click events listeners to all gesture buttons.
     * When clicked, triggers a round if game is active.
     */
    for (const choicesBtn of choicesBtns) {
        choicesBtn.addEventListener("click", function() {
            if (!gameActive) return;
            const playerChoice = parseInt(this.getAttribute("data-choice"));
            playGame(playerChoice);
        });
    } 

    /**
     * Click event to start a new round when "PLAY NOW" button is pressed.
     */
    playBtn.addEventListener("click", function () {
        runGame();
    });

    /**
     * Initializes a new round:
     * - Reserts player state
     * - Enables gesture selection
     * - Starts countdown timer
     */
    function runGame() {
        if (gameActive) return;
        gameActive = true;
        resetGesture();
        playerHasChosen = false;
        playBtn.disabled = true;
        startTimer(5);
    }

    /**
     * Starts the countdown timer for gesture selection.
     * If the timer runs out without a player selection,
     * the round is autmatically lost by the player.
     * @param {number} time - Starting value for countdown in seconds 
     */
    function startTimer(time) {
        clearInterval(timerInterval);
        countdown = time;
        playBtn.textContent = countdown;
        playBtn.classList.add("countdown-active");
        enableChoiceBtns(true);
        gameActive = true;
        playerHasChosen = false;

        timerInterval = setInterval(() => {
           countdown--;
           playBtn.textContent = countdown;

           if (countdown === 0) {
            clearInterval(timerInterval);
            if (!playerHasChosen) {
                autoLoseRound();
            }
           }
        },1000 );
    }

    /**
     * Ends the current round:
     * - Stops the timer
     * - Disables choices buttons
     * - Updates the play button text
     */
    function endGame() {
        gameActive = false;
        clearInterval(timerInterval);
        enableChoiceBtns(false);
        playBtn.classList.remove("countdown-active");
        playBtn.textContent = "PLAY AGAIN";
    }

    /**
     * Returns a random gesture index from the list of choices
     * @returns {number} Index of randomly selected gesture
     */
    function randomChoice() {
        return Math.floor(Math.random() * choices.length);
    }

    /**
     * Executes a full game round: computer randomly picks a gesture,
     * outcome is determined, score updated, and result displayed.
     * @param {number} playerChoice - Index of the player's gesture choice
     */
    function playGame (playerChoice) {
        playerHasChosen = true;
        clearInterval(timerInterval);

        const compChoice = randomChoice();
        const playerMove = choices[playerChoice];
        const compMove = choices[compChoice];

        playerGesture.src = `assets/images/${playerMove}.webp`;
        compGesture.src = `assets/images/${compMove}.webp`;

        const winner = determineWinner(playerChoice, compChoice);
        updateScore(winner.result);
        displayAlert(winner);
    }

    /**
     * Handles scenario where player does not select a gesture before timer ends.
     * Computer gets the point by default, and a failure image is shown.
     */
    function autoLoseRound() {
        clearInterval(timerInterval);
        gameActive = false;

        const compChoice = randomChoice();
        const compMove = choices[compChoice];

        compGesture.src = `assets/images/${compMove}.webp`;
        playerGesture.src = "assets/images/failed.webp";

        updateScore("comp");

        Swal.fire({
            icon: 'error',
            title: 'You failed!',
            text: "You didn't choose in time.",
            confirmButtonText: 'Try again'
        }).then(() => {
            checkMatchEnd();
            endGame();
            if (playerPoints < winningScore && compPoints < winningScore) {
                startTimer(5);
            }
        });
    }

    /**
     * Determines the outcome of a round based on gesture indexes.
     * @param {number} playerChoice - Player's gesture index
     * @param {number} compChoice - Computer's gesture index
     * @returns {Object} Result object with winner and involved indexes
     */
    function determineWinner(playerChoice, compChoice) {
        if (playerChoice === compChoice) { 
            return { result : "draw" };
        }

        if (rules[playerChoice].includes(compChoice)) {
            return { 
                result:"player", 
                winnerIndex:playerChoice, 
                loserIndex: compChoice 
            };
        } else {
            return { 
                result: "comp", 
                winnerIndex: compChoice, 
                loserIndex: playerChoice 
            };
        }
    }

    /**
     * Displays a SweetAlert popup indicating the result of the round.
     * Includes visual feedback and descriptive text.
     * @param {Object} resultObj - Object with result, winnerIndex and loserIndex 
     */
    function displayAlert({result, winnerIndex, loserIndex}) {
        clearInterval(timerInterval);

        if (result === "draw") {
           Swal.fire({
                icon: 'info',
                title: 'Draw!',
                confirmButtonText: 'OK',
           }).then(() => {
                checkMatchEnd();
                endGame();
                if (playerPoints < winningScore && compPoints < winningScore) {
                    startTimer(5);
                }
           });
            return;
        }

        const subject = choices[winnerIndex];
        const object = choices[loserIndex];
        const verb = messages[winnerIndex][loserIndex];
        const detail = `${capitalize(subject)} ${verb} ${capitalize(object)}`;
        const heading = result === "player" ? "You win!" : "You lose!";

        Swal.fire({
            icon: result === "player" ? "success" : "error",
            title: heading,
            text: detail,
            confirmButtonText: 'Continue'
        }).then(() => {
            checkMatchEnd();
            endGame();
            if (playerPoints < winningScore && compPoints < winningScore) {
                startTimer(5);
            }
        });
    }

    /**
     * Updates the game score and displays it in the UI.
     * @param {string} winner - Either "player", "comp", or "draw"
     */
    function updateScore(winner) {
        if (winner === "player") {
            playerPoints++;
        } else if (winner === "comp") {
            compPoints++;
        }

        playerScore.textContent = "Player: " + playerPoints;
        compScore.textContent = "Comp: " + compPoints;
    }

    /**
     * Checks if either player has won the match.
     */
    function checkMatchEnd() {
        if (playerPoints >= winningScore || compPoints >= winningScore) {
            const bestOfFive = playerPoints > compPoints ? "player" : "comp";
            showMatchWinner(bestOfFive);
        }
    }

    /**
     * Displays match winner and resets the match after confirmation
     */
    function showMatchWinner(bestOfFive) {
        const winTitle = bestOfFive === "player" ? "You won the match!" : "The computer wins the match!";
        const winText = `Final score: Player ${playerPoints} - ${compPoints} Computer`;

        Swal.fire({
            icon: bestOfFive === "player" ? "success" : "error",
            title: winTitle,
            text: winText,
            confirmButtonText: "Play new match"
        }).then(() => {
            resetMatch();
        });
    }

    /**
     * Resets match scores an UI to initial state
     */
    function resetMatch() {
        playerPoints = 0;
        compPoints = 0;
        playerScore.textContent = "Player: 0";
        compScore.textContent = "Comp: 0";
        resetGesture();
        playBtn.disabled = false;
        playBtn.textContent = "PLAY NOW";
    }

    /**
     * Resets both gesture images to the deault "rock" image.
     */
    function resetGesture() {
        playerGesture.src = "assets/images/rock.webp";
        compGesture.src = "assets/images/rock.webp";
    }

    /**
     * Enables or diables all gesture selection buttons.
     * @param {boolean} enabled - Whether buttons should be clickable
     */
    function enableChoiceBtns(enabled) {
        for (let choicesBtn of choicesBtns) {
            choicesBtn.disabled = !enabled;
            choicesBtn.classList.toggle("disable-btn", !enabled);
        }   
    }

    /**
     * Capitalizes the first letter of a given string.
     * @param {string} string - The string to capitalize
     * @returns {string} The capitalized string
     */
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
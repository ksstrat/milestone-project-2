// Wait for the DOM to finish loading before running the game
document.addEventListener("DOMContentLoaded", function() {

    /**
    * Declare constants for DOM elements and possible choices
    */
    const playerGesture = document.getElementById("player-gesture");
    const compGesture = document.getElementById("comp-gesture");
    const playerScore = document.getElementById("player-score");
    const compScore = document.getElementById("comp-score");
    const playBtn = document.getElementById("play-btn");
    const playerWins = document.getElementById("player-wins");
    const compWins = document.getElementById("comp-wins");
    const drawScore = document.getElementById("draw-score");
    const scrollArrow = document.getElementById("scroll-arrow");

    const choicesBtns = document.getElementsByClassName("choices-btn");

    const winningScore = 3;

    const choices = ["rock", "paper", "scissors", "lizard", "spock"];
    
    // Game State
    let gameActive = false;
    let playerPoints = 0;
    let compPoints = 0;
    let playerMatches = 0;
    let compMatches = 0;
    let draws = 0;

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
     * Object mapping gesture win interactions to descriptive verbs
     */
    const messages = {
        0: { 2: "crushes", 3: "crushes"},
        1: { 0: "covers", 4: "disproves"},
        2: { 1: "cuts", 3: "decapitates"},
        3: { 1: "poisons", 4: "eats"},
        4: { 0: "vaporizes", 2: "smashes" }
    };

    /**
     * Adds click event listeners to all gesture buttons.
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
     * Click event to start a new round when "Start best of five" button is pressed.
     */
    playBtn.addEventListener("click", function () {
        runGame();
    });

    /**
     * On load: Check if the page is scrollable
     * If the page is not scrollable, the scroll arrow is hidden immediately.
     */
    window.addEventListener("load", function () {
        const scrollable = document.documentElement.scrollHeight > window.innerHeight;
        if (!scrollable) {
            scrollArrow.classList.add("hidden");
        }
    });

    /**
     * On window scroll:
     * - Continuously checks if the page is scrollable.
     * - Detects whether the user has scrolled to the bottom of the page.
     * - Hides the scroll arrow if at the bottom.
     * - Shows the scroll arrow if there is more content below.
     */
    window.addEventListener("scroll", function () {
        const scrollable = document.documentElement.scrollHeight > window.innerHeight;
        const scrolledToBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
    
        if (scrollable && !scrolledToBottom) {
            scrollArrow.classList.remove("hidden");
        } else {
            scrollArrow.classList.add("hidden");
        }
    });

    /**
     * Initializes a new round:
     * - Resets player state
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
     * the round is automatically lost by the player.
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
     * - Disables choice buttons
     * - Updates the play button text
     */
    function endGame() {
        gameActive = false;
        clearInterval(timerInterval);
        enableChoiceBtns(false);
        playBtn.classList.remove("countdown-active");
        playBtn.innerHTML = '<img id="play-img" src="assets/images/play_btn.webp" alt="Play button">';
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
            confirmButtonText: 'Try again',
            position: "bottom",
            width: "75%",
            allowOutsideClick: false,
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
                position: "bottom",
                width: "75%",
                allowOutsideClick: false,
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
            confirmButtonText: 'Continue',
            position: "bottom",
            width: "75%",
            allowOutsideClick: false,
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
        } else {
            draws++;
        }

        playerScore.textContent = "Round: " + playerPoints;
        compScore.textContent = "Round: " + compPoints;
        drawScore.textContent = draws;
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

        if (bestOfFive === "player") {
            playerMatches++;
        } else {
            compMatches++;
        }

        Swal.fire({
            icon: bestOfFive === "player" ? "success" : "error",
            title: winTitle,
            text: winText,
            confirmButtonText: "Play new match",
            position: "bottom",
            width: "75%",
            allowOutsideClick: false,
        }).then(() => {
            playerWins.textContent = "Wins: " + playerMatches;
            compWins.textContent = "Wins: " + compMatches;
            resetMatch();
        });
    }

    /**
     * Resets match scores an UI to initial state
     */
    function resetMatch() {
        playerPoints = 0;
        compPoints = 0;
        draws = 0;
        playerScore.textContent = "Round: 0";
        compScore.textContent = "Round: 0";
        drawScore.textContent = "0";
        resetGesture();
        playBtn.disabled = false;
        playBtn.innerHTML = '<img id="play-img" src="assets/images/play_btn.webp" alt="Play button">';
    }

    /**
     * Resets both gesture images to the default "rock" image.
     */
    function resetGesture() {
        playerGesture.src = "assets/images/rock.webp";
        compGesture.src = "assets/images/rock.webp";
    }

    /**
     * Enables or disables all gesture selection buttons.
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
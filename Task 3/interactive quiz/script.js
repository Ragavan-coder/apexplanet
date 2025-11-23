const questions = [
  {
    question: "Which HTML tag is used to include JavaScript?",
    options: ["<js>", "<javascript>", "<script>", "<code>"],
    correct: 2
  },
  {
    question: "Which method selects an element by ID?",
    options: ["querySelector()", "getElementById()", "getID()", "selectID()"],
    correct: 1
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Color Style Sheet",
      "Creative Style System",
      "Cascading Style Sheets",
      "Custom Styling System"
    ],
    correct: 2
  },
  {
    question: "Which operator compares value AND type?",
    options: ["==", "===", "!=", "="],
    correct: 1
  }
];

let currentIndex = 0;
let score = 0;

const quizBox = document.getElementById("quizBox");
const resultBox = document.getElementById("resultBox");
const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const nextBtn = document.getElementById("nextBtn");
const scoreText = document.getElementById("scoreText");

const questionNumberEl = document.getElementById("questionNumber");
const liveScoreEl = document.getElementById("liveScore");
const restartBtn = document.getElementById("restartBtn");

function updateMeta() {
  questionNumberEl.textContent =
    `Question ${currentIndex + 1} of ${questions.length}`;
  liveScoreEl.textContent = `Score: ${score}`;
}

function loadQuestion() {
  const q = questions[currentIndex];

  questionText.textContent = q.question;
  optionsList.innerHTML = "";
  nextBtn.disabled = true;

  updateMeta();

  q.options.forEach((option, index) => {
    const li = document.createElement("li");
    li.textContent = option;

    li.onclick = () => selectOption(li, index);
    optionsList.appendChild(li);
  });
}

function selectOption(selectedLi, index) {
  const items = optionsList.querySelectorAll("li");
  items.forEach(li => li.classList.remove("selected"));

  selectedLi.classList.add("selected");
  nextBtn.disabled = false;

  selectedLi.dataset.index = index;
}

nextBtn.addEventListener("click", () => {
  const selected = optionsList.querySelector(".selected");
  const answer = Number(selected.dataset.index);

  if (answer === questions[currentIndex].correct) {
    score++;
  }

  currentIndex++;

  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  quizBox.style.display = "none";
  scoreText.textContent = `You scored ${score} out of ${questions.length}`;
  resultBox.style.display = "block";
}

restartBtn.addEventListener("click", () => {
  currentIndex = 0;
  score = 0;
  resultBox.style.display = "none";
  quizBox.style.display = "block";
  loadQuestion();
});

// Start quiz
loadQuestion();

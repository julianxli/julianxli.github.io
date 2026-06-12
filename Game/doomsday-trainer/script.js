const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const COMMON_DOOMSDAYS = {
  1: 3,
  2: 28,
  3: 14,
  4: 4,
  5: 9,
  6: 6,
  7: 11,
  8: 8,
  9: 5,
  10: 10,
  11: 7,
  12: 12,
};

const LEAP_DOOMSDAYS = {
  ...COMMON_DOOMSDAYS,
  1: 4,
  2: 29,
};

const START_YEAR = 1900;
const END_YEAR = 2099;

let currentDate = null;
let currentAnswer = null;
let state = "active";
let total = 0;
let correct = 0;
let streak = 0;

const dateDisplay = document.querySelector("#dateDisplay");
const feedback = document.querySelector("#feedback");
const solution = document.querySelector("#solution");
const answerButtons = Array.from(document.querySelectorAll(".answer-button"));
const nextButton = document.querySelector("#nextButton");
const solutionButton = document.querySelector("#solutionButton");
const resetButton = document.querySelector("#resetButton");

const totalStat = document.querySelector("#totalStat");
const correctStat = document.querySelector("#correctStat");
const accuracyStat = document.querySelector("#accuracyStat");
const streakStat = document.querySelector("#streakStat");

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function randomDate(startYear = START_YEAR, endYear = END_YEAR) {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * daysInMonth(year, month));
  return new Date(year, month - 1, day);
}

function weekdayLabel(weekday) {
  return `${WEEKDAY_NAMES[weekday]} = ${weekday}`;
}

function centuryAnchorDay(year) {
  const century = Math.floor(year / 100);
  return (5 * (century % 4) + 2) % 7;
}

function monthDoomsdayDay(year, month) {
  return (isLeapYear(year) ? LEAP_DOOMSDAYS : COMMON_DOOMSDAYS)[month];
}

function analyzeDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const y = year % 100;
  const q = Math.floor(y / 12);
  const r = y % 12;
  const s = Math.floor(r / 4);
  const yearOffset = q + r + s;
  const centuryAnchor = centuryAnchorDay(year);
  const yearDoomsday = (centuryAnchor + yearOffset) % 7;
  const monthDoomsday = monthDoomsdayDay(year, month);
  const offset = day - monthDoomsday;
  const finalWeekday = mod(yearDoomsday + offset, 7);
  const dateWeekday = date.getDay();

  return {
    date,
    year,
    century: Math.floor(year / 100) * 100,
    month,
    monthName: MONTH_NAMES[month],
    day,
    y,
    q,
    r,
    s,
    yearOffset,
    centuryAnchor,
    yearDoomsday,
    monthDoomsday,
    offset,
    finalWeekday,
    dateWeekday,
    isLeap: isLeapYear(year),
  };
}

function mod(value, base) {
  return ((value % base) + base) % base;
}

function buildSolutionHtml(date) {
  const parts = analyzeDate(date);
  const monthRows = [
    ["Jan", parts.isLeap ? 4 : 3],
    ["Feb", parts.isLeap ? 29 : 28],
    ["Mar", 14],
    ["Apr", 4],
    ["May", 9],
    ["Jun", 6],
    ["Jul", 11],
    ["Aug", 8],
    ["Sep", 5],
    ["Oct", 10],
    ["Nov", 7],
    ["Dec", 12],
  ];

  return [
    `<div class="solution-title">Conway Doomsday Algorithm</div>`,
    `<section class="solution-section">
      <h2>Target Date</h2>
      <p class="target-date">${formatDate(date)}</p>
    </section>`,
    `<section class="solution-section">
      <h2>Century Anchor Day</h2>
      <div class="anchor-grid">
        <span>1600s</span><b>Tuesday = 2</b>
        <span>1700s</span><b>Sunday = 0</b>
        <span>1800s</span><b>Friday = 5</b>
        <span>1900s</span><b>Wednesday = 3</b>
        <span>2000s</span><b>Tuesday = 2</b>
        <span>2100s</span><b>Sunday = 0</b>
        <span>2200s</span><b>Friday = 5</b>
        <span>2300s</span><b>Wednesday = 3</b>
      </div>
      <p>The century anchor repeats every 400 years.</p>
      <div class="formula">For ${parts.century}s: ${weekdayLabel(parts.centuryAnchor)}</div>
    </section>`,
    `<section class="solution-section">
      <h2>Year Calculation</h2>
      <div class="formula-stack">
        <div class="formula">y = ${parts.y}</div>
        <div class="formula">q = <span class="floor">⌊</span> y / 12 <span class="floor">⌋</span> = <span class="floor">⌊</span> ${parts.y} / 12 <span class="floor">⌋</span> = ${parts.q}</div>
        <div class="formula">r = y mod 12 = ${parts.y} mod 12 = ${parts.r}</div>
        <div class="formula">s = <span class="floor">⌊</span> r / 4 <span class="floor">⌋</span> = <span class="floor">⌊</span> ${parts.r} / 4 <span class="floor">⌋</span> = ${parts.s}</div>
        <div class="formula">year_offset = q + r + s = ${parts.q} + ${parts.r} + ${parts.s} = ${parts.yearOffset}</div>
      </div>
    </section>`,
    `<section class="solution-section">
      <h2>Year Doomsday</h2>
      <div class="formula">year_doomsday = (century_anchor + year_offset) mod 7</div>
      <div class="formula">year_doomsday = (${parts.centuryAnchor} + ${parts.yearOffset}) mod 7 = ${weekdayLabel(parts.yearDoomsday)}</div>
    </section>`,
    `<section class="solution-section">
      <h2>Month Doomsday Date</h2>
      <p>${parts.year} is ${parts.isLeap ? "a leap year" : "a common year"}.</p>
      <div class="month-grid">
        ${monthRows
          .map(
            ([month, day]) =>
              `<span class="${month === parts.monthName ? "current-month" : ""}">${month} ${day}</span>`,
          )
          .join("")}
      </div>
      <div class="formula">${parts.monthName} doomsday = ${parts.monthDoomsday}</div>
    </section>`,
    `<section class="solution-section">
      <h2>Date Offset</h2>
      <div class="formula">offset = target_day - month_doomsday_day</div>
      <div class="formula">offset = ${parts.day} - ${parts.monthDoomsday} = ${parts.offset}</div>
    </section>`,
    `<section class="solution-section">
      <h2>Final Answer</h2>
      <div class="formula">final_weekday = (year_doomsday + offset) mod 7</div>
      <div class="formula final-formula">(${parts.yearDoomsday} + ${parts.offset}) mod 7 = ${weekdayLabel(parts.finalWeekday)}</div>
    </section>`,
  ].join("");
}

function newQuestion() {
  currentDate = randomDate();
  currentAnswer = currentDate.getDay();
  state = "active";
  dateDisplay.textContent = formatDate(currentDate);
  feedback.textContent = "";
  feedback.className = "feedback";
  solution.innerHTML = "";
  answerButtons.forEach((button) => {
    button.disabled = false;
  });
}

function submitAnswer(answer) {
  const selected = Number(answer);

  if (state !== "active") {
    feedback.textContent = "Press Next for a new question.";
    feedback.className = "feedback";
    return;
  }

  const isCorrect = selected === currentAnswer;
  total += 1;

  if (isCorrect) {
    correct += 1;
    streak += 1;
    feedback.textContent = `Correct. ${weekdayLabel(currentAnswer)}.`;
    feedback.className = "feedback correct";
  } else {
    streak = 0;
    feedback.textContent = `Wrong. Correct answer: ${weekdayLabel(currentAnswer)}.`;
    feedback.className = "feedback wrong";
  }

  state = "revealed";
  answerButtons.forEach((button) => {
    button.disabled = true;
  });
  updateStats();
}

function showSolution() {
  solution.innerHTML = buildSolutionHtml(currentDate);
}

function resetStats() {
  total = 0;
  correct = 0;
  streak = 0;
  updateStats();
}

function updateStats() {
  const accuracy = total === 0 ? 0 : (correct / total) * 100;
  totalStat.textContent = total;
  correctStat.textContent = correct;
  accuracyStat.textContent = `${accuracy.toFixed(1)}%`;
  streakStat.textContent = streak;
}

function runAlgorithmTests() {
  const cases = [
    ["2026-06-12", 5],
    ["2024-02-29", 4],
    ["2000-01-01", 6],
    ["1900-01-01", 1],
    ["1970-01-01", 4],
  ];

  const results = cases.map(([iso, expected]) => {
    const [year, month, day] = iso.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const analysis = analyzeDate(date);
    const passed =
      analysis.dateWeekday === expected && analysis.finalWeekday === expected;
    return {
      date: iso,
      expected: weekdayLabel(expected),
      dateGetDay: weekdayLabel(analysis.dateWeekday),
      doomsday: weekdayLabel(analysis.finalWeekday),
      passed,
    };
  });

  console.table(results);
  const allPassed = results.every((result) => result.passed);
  console.log(`Doomsday algorithm tests: ${allPassed ? "PASS" : "FAIL"}`);
}

answerButtons.forEach((button) => {
  button.addEventListener("click", () => submitAnswer(button.dataset.answer));
});

nextButton.addEventListener("click", newQuestion);
solutionButton.addEventListener("click", showSolution);
resetButton.addEventListener("click", resetStats);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (/^[0-6]$/.test(event.key)) {
    submitAnswer(event.key);
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    newQuestion();
    return;
  }

  if (key === "s") {
    showSolution();
    return;
  }

  if (key === "r") {
    resetStats();
  }
});

runAlgorithmTests();
updateStats();
newQuestion();

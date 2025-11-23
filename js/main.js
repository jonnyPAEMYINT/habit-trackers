
let habits = JSON.parse(localStorage.getItem("habits") || "{}");
let lastTouchEnd = 0;

document.addEventListener(
  "touchend",
  function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();  // cancel iOS double-tap zoom
    }
    lastTouchEnd = now;
  },
  { passive: false }
);

function save() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function addHabit() {
    const habitNameContrl = document.getElementById("habitName");
    const name = habitNameContrl.value.trim();
    if (!name) return;
    if (!habits[name]) habits[name] = {};
    save();
    renderHabits();
    habitNameContrl.value = '';
}

function deleteHabit(name) {
    delete habits[name];
    save();
    renderHabits();
}

function recordHabit() {
    const habit = document.getElementById("habitSelect").value;
    const today = new Date().toISOString().split("T")[0];
    if (!habits[habit][today]) habits[habit][today] = 0;
    habits[habit][today]++;
    save();
    renderChart();
}

function renderHabits() {
  const list = document.getElementById("habitList");
  const select = document.getElementById("habitSelect");
  list.innerHTML = "";
  select.innerHTML = "";

  Object.keys(habits).forEach(h => {
    // Habit list in "Show/Hide Your Habits"
    const div = document.createElement("div");
    div.className = "habit-item";

    div.innerHTML = `
      <span id="habit-${h}">${h}</span>
      <div>
        <button title="Rename" onclick="preventDoubleTap(this, () => toggleRename('${h}'))">✏️</button>
        <button title="Delete" onclick="preventDoubleTap(this, () => deleteHabit('${h}'))">🗑️</button>
      </div>
    `;
    list.appendChild(div);

    // Dropdown in "Daily Tracking"
    const option = document.createElement("option");
    option.value = h;
    option.textContent = h;
    select.appendChild(option);
  });

  // Keep habits section visible even after reload
  const card = document.getElementById("habitCard");
  card.style.display = Object.keys(habits).length ? "block" : "none";

  renderChart();
}

function toggleRename(oldName) {
  const span = document.getElementById(`habit-${oldName}`);
  if (span.tagName.toLowerCase() === "input") {
    const newName = span.value.trim();
    if (!newName || newName === oldName) {
      renderHabits();
      return;
    }
    habits[newName] = habits[oldName];
    delete habits[oldName];
    save();
    renderHabits();
  } else {
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldName;
    input.style.width = "70%";
    input.id = `habit-${oldName}`;
    span.replaceWith(input);
    input.focus();
    input.select();
  }
}

function renderChart() {
    const container = document.getElementById("reportGrid");
    container.innerHTML = "";

    const habitNames = Object.keys(habits);
    if (!habitNames.length) {
        container.innerHTML = "<p>No habits yet</p>";
        return;
    }

    // Get this week's Monday → Sunday
    const weekDays = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        const dayOfWeek = today.getDay();
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
        d.setDate(today.getDate() + diffToMonday + i);

        weekDays.push({
            date: d.toISOString().split("T")[0],
            label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]
        });
    }

    habitNames.forEach(habit => {
        const habitRow = document.createElement("div");

        // Habit name label
        const habitLabel = document.createElement("div");
        habitLabel.className = "habit-name";
        habitLabel.textContent = habit;
        habitRow.appendChild(habitLabel);

        // Day grid
        const grid = document.createElement("div");
        grid.className = "habit-grid";

        weekDays.forEach(day => {
            const done = habits[habit][day.date] ? true : false;
            const cell = document.createElement("div");
            cell.className = "habit-cell";
            if (done) cell.classList.add("done");  // blue background if done

            // child span for tick
            const span = document.createElement("span");
            span.textContent = done ? "✓" : "";    // tick
            cell.appendChild(span);

            // toggle on click
            cell.addEventListener("click", () => {
              const today = day.date;
              if (habits[habit][today]) {
                delete habits[habit][today];  // reset
                cell.classList.remove("done");
                span.textContent = "";
              } else {
                habits[habit][today] = 1;     // mark done
                cell.classList.add("done");
                span.textContent = "✓";
              }
              save();
            });
            grid.appendChild(cell);
        });

        habitRow.appendChild(grid);
        container.appendChild(habitRow);
    });

    // Day labels
    const dayLabelRow = document.createElement("div");
    dayLabelRow.className = "day-labels";

    weekDays.forEach(day => {
        const lbl = document.createElement("div");
        lbl.textContent = day.label;
        dayLabelRow.appendChild(lbl);
    });

    container.appendChild(dayLabelRow);
}

function resetRecords() {
    //if (!confirm("Are you sure you want to clear all records? This cannot be undone.")) return;

    Object.keys(habits).forEach(habit => {
        habits[habit] = {}; // Clear all records but keep the habit
    });

    save();
    renderChart();
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const icon = document.getElementById("darkToggle");
    icon.classList.toggle("active");
}

function toggleHabits() {
    const card = document.getElementById("habitCard");
    const btn = document.getElementById("toggleHabitsBtn");

    // toggle visibility
    const isHidden = card.style.display === "none";

    card.style.display = isHidden ? "block" : "none";

    // update button label
    btn.textContent = isHidden ? "Hide Your Habits" : "Show Your Habits";
}

function preventDoubleTap(btn, callback) {
    if (btn.disabled) return;
    btn.disabled = true;
    callback();

    setTimeout(() => {
        btn.disabled = false;
    }, 400); // 400ms is the sweet spot for iOS
}

document.addEventListener("DOMContentLoaded", function() {
    renderHabits();

    document.getElementById("habitName").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addHabit();
        }
    });
});



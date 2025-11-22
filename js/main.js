
let habits = JSON.parse(localStorage.getItem("habits") || "{}");

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
        <button title="Rename" onclick="toggleRename('${h}')">✏️</button>
        <button title="Delete" onclick="deleteHabit('${h}')">🗑️</button>
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
    container.innerHTML = ""; // clear old content

    const habitNames = Object.keys(habits);
    if (!habitNames.length) {
        container.innerHTML = "<p>No habits yet</p>";
        return;
    }

    // Get the last 7 days starting from Monday
    const weekDays = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        // Set date to Monday of this week + i days
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday...
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek); // how many days to go back to Monday
        d.setDate(today.getDate() + diffToMonday + i);
        weekDays.push({
            date: d.toISOString().split("T")[0],
            label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]
        });
    }

    habitNames.forEach(habit => {
        const habitRow = document.createElement("div");

        // Habit name
        const habitLabel = document.createElement("div");
        habitLabel.className = "habit-name";
        habitLabel.textContent = habit;
        habitRow.appendChild(habitLabel);

        // 7-day grid
        const grid = document.createElement("div");
        grid.className = "habit-grid";

        weekDays.forEach(day => {
            const cell = document.createElement("div");
            cell.className = "habit-cell";
            const done = habits[habit][day.date] ? true : false;
            cell.style.backgroundColor = done ? "#007BFF" : "#000000";

            const span = document.createElement("span");
            span.textContent = done ? "✓" : "";
            cell.appendChild(span);
            grid.appendChild(cell);
        });

        habitRow.appendChild(grid);
        container.appendChild(habitRow);
    });

    // Add day labels under grid
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
    card.style.display = card.style.display === "none" ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", function() {
    renderHabits();
});

document.getElementById("habitName").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addHabit();
    }
});

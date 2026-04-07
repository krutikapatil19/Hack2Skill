document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const userInput = document.getElementById('user-input');
    const resultSection = document.getElementById('recommendation-result');
    const dishTitle = document.getElementById('dish-title');
    const metricScore = document.getElementById('metric-score');
    const metricCals = document.getElementById('metric-cals');
    const dishTags = document.getElementById('dish-tags');
    const mealBreakfast = document.getElementById('meal-breakfast');
    const mealLunch = document.getElementById('meal-lunch');
    const mealDinner = document.getElementById('meal-dinner');
    const dishBenefits = document.getElementById('dish-benefits');
    const remCard = document.getElementById('rem-card');

    const logoutBtn = document.getElementById('logout-btn');
    const resetBtn = document.getElementById('reset-btn');
    const historyList = document.getElementById('history-list');
    const dailyReminder = document.getElementById('daily-reminder');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const moodSummary = document.getElementById('mood-summary');
    const dietPreference = document.getElementById('diet-preference');
    const saveMealBtn = document.getElementById('save-meal-btn');
    const savedList = document.getElementById('saved-list');
    const voiceBtn = document.getElementById('voice-btn');

    // --- Voice Input Logic ---
    if (voiceBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
                voiceBtn.classList.add('recording');
                voiceBtn.title = "Listening...";
                userInput.placeholder = "Listening...";
            };

            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                voiceBtn.classList.remove('recording');
                voiceBtn.title = "Click to speak";
                userInput.placeholder = "e.g., 'Feeling stressed' or 'High protein lunch'";
            };

            recognition.onerror = function() {
                voiceBtn.classList.remove('recording');
                voiceBtn.title = "Error listening. Try again.";
                userInput.placeholder = "Error hearing you.";
            };

            recognition.onend = function() {
                voiceBtn.classList.remove('recording');
                userInput.placeholder = "e.g., 'Feeling stressed' or 'High protein lunch'";
            };

            voiceBtn.addEventListener('click', () => {
                if (voiceBtn.classList.contains('recording')) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });
        } else {
            // Browser unsupported
            voiceBtn.style.display = 'none';
            console.warn("Speech recognition not supported in this browser.");
        }
    }

    // --- Theme Toggle ---
    if (themeToggleBtn) {
        const isLight = document.documentElement.classList.contains('light-mode');
        themeToggleBtn.innerText = isLight ? '🌙' : '🌞';

        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-mode');
            const newIsLight = document.documentElement.classList.contains('light-mode');
            localStorage.setItem('aiFoodTheme', newIsLight ? 'light' : 'dark');
            themeToggleBtn.innerText = newIsLight ? '🌙' : '🌞';
        });
    }

    const loader = generateBtn ? generateBtn.querySelector('.loader') : null;
    const btnText = generateBtn ? generateBtn.querySelector('.btn-text') : null;

    // --- Daily Reminder Feature ---
    const reminders = [
        "Don't skip your meals today!",
        "Remember to stay hydrated!",
        "Eating mindfully brings joy to you.",
        "A healthy outside starts from the inside.",
        "Nourish your body and it will take care of you."
    ];
    if (dailyReminder) {
        dailyReminder.innerText = "💡 " + reminders[Math.floor(Math.random() * reminders.length)];
    }

    // --- Core State ---
    let currentPlan = null; // Will hold the active generated plan
    
    // --- History & Favorites ---
    let userHistory = JSON.parse(localStorage.getItem('aiFoodHistory')) || [];
    let savedMeals = JSON.parse(localStorage.getItem('aiFoodSaved')) || [];

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        if (userHistory.length === 0) {
            historyList.innerHTML = '<li class="empty-history">No history yet. Generate a meal!</li>';
            return;
        }

        userHistory.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';

            const dateObj = new Date(item.timestamp);
            let hours = dateObj.getHours();
            let minutes = dateObj.getMinutes();
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            const strTime = hours + ':' + minutes + ' ' + ampm;

            li.innerHTML = `
                <div class="hist-input-line">
                    <span class="hist-query">"${item.input}"</span>
                    <span class="hist-time">${strTime}</span>
                </div>
                <div class="hist-result-line">${item.resultTitle}</div>
            `;
            historyList.appendChild(li);
        });
    }

    function renderSavedMeals() {
        if (!savedList) return;
        savedList.innerHTML = '';
        
        if (savedMeals.length === 0) {
            savedList.innerHTML = '<li class="empty-history">No saved plans yet. Bookmark your favorites!</li>';
            return;
        }

        savedMeals.forEach((meal, index) => {
            const li = document.createElement('li');
            li.className = 'saved-item';
            
            li.innerHTML = `
                <div class="saved-header">
                    <h4>${meal.title}</h4>
                    <button class="remove-saved-btn" title="Remove" data-index="${index}">✖</button>
                </div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-secondary);">
                    <strong>Breakfast:</strong> ${meal.meals.breakfast}<br>
                    <strong>Lunch:</strong> ${meal.meals.lunch}<br>
                    <strong>Dinner:</strong> ${meal.meals.dinner}
                </div>
            `;
            
            savedList.appendChild(li);
        });

        // Attach event listeners for delete buttons
        document.querySelectorAll('.remove-saved-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                savedMeals.splice(idx, 1);
                localStorage.setItem('aiFoodSaved', JSON.stringify(savedMeals));
                renderSavedMeals();
            });
        });
    }

    function renderAnalytics() {
        if (!moodSummary) return;
        if (userHistory.length === 0) {
            moodSummary.innerText = "Generate at least one meal to see your mood summary!";
            return;
        }

        const knownMoods = {
            "stressed": ["stress", "stressed", "overwhelmed", "busy"],
            "tired": ["tired", "exhausted", "sleepy", "burnout"],
            "happy": ["happy", "great", "good", "excited", "joy"],
            "anxious": ["anxious", "worried", "nervous"],
            "sad": ["sad", "depressed", "down", "bad"],
            "energetic": ["energetic", "hyper", "pumped"],
            "sick": ["sick", "unwell", "ill"]
        };

        const moodCounts = {};

        userHistory.forEach(item => {
            const str = item.input.toLowerCase();
            let found = false;
            for (const [mood, words] of Object.entries(knownMoods)) {
                if (words.some(w => str.includes(w))) {
                    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
                    found = true;
                }
            }
            if (!found) {
                moodCounts["neutral"] = (moodCounts["neutral"] || 0) + 1;
            }
        });

        let highestMood = "neutral";
        let highestCount = 0;

        for (const [mood, count] of Object.entries(moodCounts)) {
            if (count > highestCount && mood !== "neutral") {
                highestCount = count;
                highestMood = mood;
            } else if (count > highestCount && highestCount === 0) {
                highestCount = count;
                highestMood = mood;
            }
        }

        if (highestMood === "neutral" && highestCount > 0) {
            moodSummary.innerText = `Insight: Your recent moods trend towards neutral or balanced.`;
        } else {
            moodSummary.innerHTML = `Insight: You often feel <strong style="text-transform: capitalize;">${highestMood}</strong> (detected ${highestCount} time${highestCount !== 1 ? 's' : ''} recently).`;
        }
    }

    renderHistory();
    renderSavedMeals();
    renderAnalytics();

    const mealPlans = [
        {
            type: "standard",
            diets: ["none", "low-carb", "high-protein"],
            title: "Vitality Boost Meal Plan",
            healthScore: 92,
            calories: 1450,
            tags: ["High Protein", "Antioxidants", "Low Carb"],
            meals: {
                breakfast: "Spinach and mushroom egg white omelete with a side of fresh berries.",
                lunch: "Grilled chicken salad with mixed greens, avocado, walnuts, and a light vinaigrette.",
                dinner: "Baked salmon with quinoa and lemon-roasted asparagus."
            },
            benefits: "Rich in omega-3 fatty acids for brain health, high in lean protein for muscle recovery, and packed with antioxidants to reduce inflammation."
        },
        {
            type: "standard",
            diets: ["none", "vegan", "vegetarian"],
            title: "Plant-Powered Energy Plan",
            healthScore: 95,
            calories: 1800,
            tags: ["Vegan", "High Fiber", "Iron Rich"],
            meals: {
                breakfast: "Overnight oats with chia seeds, almond milk, and mixed berries.",
                lunch: "Hearty lentil and vegetable soup with a side of sweet potato chunks.",
                dinner: "Chickpea and spinach curry served over warm brown rice."
            },
            benefits: "Excellent source of dietary fiber for digestion, plant-based iron for sustained energy levels, and complex carbohydrates to keep you full."
        },
        {
            type: "standard",
            diets: ["none", "vegetarian"],
            title: "Comfort & Recovery Plan",
            healthScore: 88,
            calories: 1650,
            tags: ["Warm", "Immunity", "Gut Health"],
            meals: {
                breakfast: "Warm oatmeal topped with cinnamon, chopped walnuts, and sliced bananas.",
                lunch: "Miso and ginger noodle soup with steamed bok choy and soft-boiled egg.",
                dinner: "Ginger soy glazed tofu with steamed broccoli and soba noodles."
            },
            benefits: "Soothing for the digestive system, warm and comforting to reduce stress, and loaded with immune-boosting properties like ginger and broth."
        },
        {
            type: "healthy-alternative",
            diets: ["none", "vegan", "vegetarian", "low-carb", "high-protein"],
            title: "Mindful Support Plan",
            healthScore: 98,
            calories: 1550,
            tags: ["Stress Relief", "Magnesium Rich", "Calming"],
            meals: {
                breakfast: "Green magnesium-rich smoothie with spinach, avocado, and banana.",
                lunch: "Nourish bowl with edamame, cucumber, shredded carrots, and a tahini drizzle.",
                dinner: "Warm turkey or tempeh chili with a side of dark chocolate for mood regulation."
            },
            benefits: "Loaded with magnesium and complex carbs which naturally reduce cortisol levels and stabilize your mood during prolonged stressful periods."
        }
    ];

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const query = userInput.value.trim();
            if (!query) {
                alert("Please enter your mood or preferences first!");
                return;
            }

            btnText.style.display = 'none';
            loader.style.display = 'block';
            generateBtn.disabled = true;
            resultSection.classList.add('hidden');
            if (remCard) remCard.style.boxShadow = "none";

            setTimeout(() => {
                // Pattern Detection for "Stress"
                const stressKeywords = ["stress", "stressed", "tired", "sad", "anxious", "busy", "exhausted", "burnout"];
                let stressedCount = 0;

                // Also check if current query is stress related
                if (stressKeywords.some(kw => query.toLowerCase().includes(kw))) {
                    stressedCount++;
                }

                userHistory.forEach(h => {
                    if (stressKeywords.some(kw => h.input.toLowerCase().includes(kw))) {
                        stressedCount++;
                    }
                });

                const pref = dietPreference ? dietPreference.value : "none";
                let plan;

                // Diet filtering
                let availablePlans = mealPlans.filter(m => m.diets.includes(pref));
                if (availablePlans.length === 0) availablePlans = mealPlans; // fallback

                if (stressedCount > 1) {
                    plan = availablePlans.find(m => m.type === "healthy-alternative") || availablePlans[0];
                    dishTitle.innerHTML = `<span style="color:#10b981; font-size: 0.8em; line-height: 1.4; display:block; margin-bottom: 0.5rem;">We noticed you've been stressed lately. Try this:</span>${plan.title}`;
                    if (remCard) remCard.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.3)";
                } else {
                    const standardPlans = availablePlans.filter(m => m.type !== "healthy-alternative");
                    plan = standardPlans.length > 0 ? standardPlans[Math.floor(Math.random() * standardPlans.length)] : availablePlans[0];
                    dishTitle.innerText = plan.title;
                }
                
                currentPlan = plan; // Set active plan for saving

                dishTags.innerHTML = '';
                plan.tags.forEach(tag => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'tag';
                    tagEl.innerText = tag;
                    dishTags.appendChild(tagEl);
                });

                metricScore.innerText = plan.healthScore;
                metricCals.innerText = plan.calories;

                mealBreakfast.innerText = plan.meals.breakfast;
                mealLunch.innerText = plan.meals.lunch;
                mealDinner.innerText = plan.meals.dinner;
                dishBenefits.innerText = plan.benefits;

                // Save to History
                userHistory.unshift({
                    input: query,
                    resultTitle: plan.title,
                    timestamp: new Date().getTime()
                });

                if (userHistory.length > 5) {
                    userHistory = userHistory.slice(0, 5);
                }
                localStorage.setItem('aiFoodHistory', JSON.stringify(userHistory));
                renderHistory();
                renderAnalytics();

                btnText.style.display = 'block';
                loader.style.display = 'none';
                generateBtn.disabled = false;
                resultSection.classList.remove('hidden');

                userInput.value = '';

            }, 1000);
        });

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                generateBtn.click();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAiFoodAssistantAuth');
            window.location.href = 'login.html';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear all your history and mood data? This cannot be undone.")) {
                localStorage.removeItem('aiFoodHistory');
                localStorage.removeItem('aiFoodSaved');
                userHistory = [];
                savedMeals = [];
                renderHistory();
                renderSavedMeals();
                renderAnalytics();
                resultSection.classList.add('hidden');
            }
        });
    }

    if (saveMealBtn) {
        saveMealBtn.addEventListener('click', () => {
            if (!currentPlan) return;
            
            // Check if already saved
            const alreadyExists = savedMeals.find(m => m.title === currentPlan.title);
            if (!alreadyExists) {
                savedMeals.unshift(currentPlan);
                localStorage.setItem('aiFoodSaved', JSON.stringify(savedMeals));
                renderSavedMeals();
                
                saveMealBtn.innerHTML = "✓ Saved!";
                saveMealBtn.style.color = "#34d399";
                saveMealBtn.style.borderColor = "#34d399";
                
                setTimeout(() => {
                    saveMealBtn.innerHTML = "⭐ Save This Plan";
                    saveMealBtn.style.color = "var(--text-primary)";
                    saveMealBtn.style.borderColor = "var(--border-color)";
                }, 2000);
            } else {
                saveMealBtn.innerHTML = "Already Saved";
                setTimeout(() => {
                    saveMealBtn.innerHTML = "⭐ Save This Plan";
                }, 2000);
            }
        });
    }
});

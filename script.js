document.addEventListener("DOMContentLoaded", fetchCategories);
        
        async function fetchCategories() {
            const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
            const data = await res.json();
            displayCategories(data.categories);
        }

        document.addEventListener("DOMContentLoaded", () => {
            // Get all nav links inside the offcanvas menu
            const navLinks = document.querySelectorAll(".offcanvas-body .nav-link");
        
            // Add click event listener to each category link
            navLinks.forEach(link => {
                link.addEventListener("click", (event) => {
                    event.preventDefault(); // Prevent page reload
        
                    const categoryName = link.textContent.trim(); // Get category name from the link text
                    fetchCategoryDetails(categoryName);
                });
            });
        });
        
        // Function to fetch category details
        async function fetchCategoryDetails(categoryName) {
            try {
                // Fetch category list to get description
                const categoryRes = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
                const categoryData = await categoryRes.json();
        
                // Find the clicked category in the API response
                const category = categoryData.categories.find(cat => cat.strCategory.toLowerCase() === categoryName.toLowerCase());
        
                if (!category) {
                    console.error("Category not found");
                    return;
                }
        
                // Fetch meals based on selected category
                const mealRes = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category.strCategory}`);
                const mealData = await mealRes.json();
        
                // Display meals with category details
                displayMeals(mealData.meals, category);
            } catch (error) {
                console.error("Error fetching category details:", error);
            }
        }
        
        
        function displayCategories(categories) {
            const container = document.getElementById("categories");
            const resultsContainer = document.getElementById("results");
            const catTitleContainer=document.getElementById("catTitle");
            container.innerHTML = "";
            catTitleContainer.innerHTML="";
            const title = document.createElement("h2");
            title.textContent = " Category";
            title.classList.add("category-title"); // Add a class for styling
        
           catTitleContainer.appendChild(title);
            categories.forEach(category => {
              
                const div = document.createElement("div");
                div.classList.add("category");
             
                div.innerHTML = `
              
                    <img src="${category.strCategoryThumb}" alt="${category.strCategory}">
               
                <span class="category-tag">${category.strCategory}</span>
            `;
                div.onclick = () => filterByCategory(category);
                container.appendChild(div);
            });
            container.style.display = "flex flex-wrap";
            resultsContainer.style.display = "none";
        }
        
        // async function searchMeal() {
        //     const query = document.getElementById("search").value;
        //     console.log(query);
        //     if (!query) return;
        //     const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        //     const data = await res.json();
        //     displayMeals(data.meals);
        // }
        const searchInput = document.getElementById("search");
        const searchButton = document.getElementById("searchBtn"); // If you have a search button
    
        // Trigger search on pressing Enter
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                searchMeal();
            }
        });
    
        // Trigger search on clicking the button
        if (searchButton) {
            searchButton.addEventListener("click", searchMeal);
        }
        async function searchMeal() {
            const query = document.getElementById("search").value.trim();
            if (!query) return;
        
            try {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
                const data = await res.json();
        
                if (!data.meals) {
                    document.getElementById("results").innerHTML = "<p>No meals found</p>";
                    return;
                }
        
                // Fetch categories to find the category of the first meal
                const catRes = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
                const catData = await catRes.json();
                
                // Get unique category from the first meal found
                const firstMealCategory = data.meals[0].strCategory;
                const selectedCategory = catData.categories.find(cat => cat.strCategory === firstMealCategory);
        
                if (selectedCategory) {
                    displayCategories([selectedCategory]); // Show only the selected category
                }
        
                // Pass the correct category to displayMeals() but hide description
                displayMeals(data.meals, selectedCategory, false);
            } catch (error) {
                console.error("Error fetching meals:", error);
            }
        }
        
        
        
    
    // Function to display "No results found"
    function displayNoResults() {
        const container = document.getElementById("results");
        container.innerHTML = `<p>No meals found. Try searching for another dish.</p>`;
    }
    async function displayMeals(meals, category, showDescription = true) {
        const container = document.getElementById("results");
        const categoriesContainer = document.getElementById("categories");
        const catTitleContainer = document.getElementById("catTitle");
    
        container.innerHTML = ""; // Clear previous meals
        catTitleContainer.innerHTML = "";
    
        if (!meals || meals.length === 0) {
            container.innerHTML = "<p>No meals found</p>";
            return;
        }
    
        // Add category description at the top
        const descriptionDiv = document.createElement("div");
        descriptionDiv.classList.add("category-description");
        descriptionDiv.innerHTML = `
            <h2>${category.strCategory}</h2>
        `;
    
        if (showDescription) {
            descriptionDiv.innerHTML += `<p>${category.strCategoryDescription}</p>`;
        }
    
        container.appendChild(descriptionDiv);
    
        const mealsTitle = document.createElement("h3");
        mealsTitle.textContent = "MEALS→";
        mealsTitle.classList.add("meals-heading");
        container.appendChild(mealsTitle);
    
        // Fetch full meal details to get `strArea`
        const mealPromises = meals.map(meal =>
            fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                .then(response => response.json())
                .then(data => data.meals ? data.meals[0] : null)
        );
    
        // Wait for all meal details to be fetched
        const fullMeals = await Promise.all(mealPromises);
    
        // Display related meals
        fullMeals.forEach(meal => {
            if (!meal) return;
    
            const div = document.createElement("div");
            div.classList.add("meal");
    
            div.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h6>${meal.strMeal}</h6>
                <p> ${meal.strArea}</p> <!-- ✅ Now displays the cuisine type -->
            `;
    
            div.onclick = () => displayMealDetails(meal.idMeal);
            container.appendChild(div);
        });
    
        container.classList.add("meals-container");
    
        // Hide categories and show results
        categoriesContainer.style.display = "none";
        container.style.display = "flex";
        catTitleContainer.style.display = "none";
    }
    

        
        

        async function filterByCategory(category) {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category.strCategory}`);
            const data = await res.json();
            displayMeals(data.meals, category);
        }
        
        // Fetch categories from API and display them
        fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
            .then(response => response.json())
            .then(data => {
                displayCategories(data.categories);
            })
            .catch(error => console.error("Error fetching categories:", error));



            function displayMealDetails(mealId) {
                const detailsContainer = document.getElementById("mealDetails");
                const resultsContainer = document.getElementById("results");
            
                // Clear previous content
                detailsContainer.innerHTML = "";
                detailsContainer.style.display = "block";
                resultsContainer.style.display = "none";
            
                // Fetch meal details
                fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.meals || data.meals.length === 0) {
                            detailsContainer.innerHTML = "<p>Meal details not found.</p>";
                            return;
                        }
            
                        const meal = data.meals[0];
            
                        // **Convert Instructions into List**
                        const instructionsArray = meal.strInstructions.split(". ").filter(step => step.trim() !== "");
                        let instructionsList = "<ul class='instructions-list'>";
                        instructionsArray.forEach((step, index) => {
                            instructionsList += `<li><strong>Step ${index + 1}:</strong> ${step}.</li>`;
                        });
                        instructionsList += "</ul>";
            
                        // **Meal Details Layout**
                        detailsContainer.innerHTML = `
                            <div class="meal-details">
                                <span>🏠 >></span> ${meal.strMeal} 
                                <h2>MEAL DETAILS</h2>
                                <div class="underline"></div>
                            </div>
            
                            <div class="row mt-4">
                                <div class="col-md-6">
                                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                                </div>  
                                <div class="col-md-6 meal-info">
                                    <h2>${meal.strMeal}</h2>
                                    <p><strong>Category:</strong> ${meal.strCategory}</p>
                                    <p><strong>Tags:</strong> <span class="tag">${meal.strTags ? meal.strTags : "N/A"}</span></p>
                                    <a href="${meal.strYoutube}" target="_blank">Watch Recipe Video</a>
                                    <p><strong>Area:</strong> ${meal.strArea}</p>
            
                                    <div class="ingredients-container">
                                        <h3>Ingredients:</h3>
                                        <ul class="ingredients-list" id="ingredientsList"></ul>
                                    </div>
                                </div>
            
                                <h3>Measure:</h3>
                                <div class="measure-card">
                                    <ul id="measureList"></ul>
                                </div>
            
                                <h3>Instructions:</h3>
                                ${instructionsList} <!-- ✅ Instructions now appear in a list -->
                            </div>
                        `;
            
                        // Populate ingredients and measures
                        const ingredientsList = document.getElementById("ingredientsList");
                        const measureList = document.getElementById("measureList");
            
                        for (let i = 1; i <= 20; i++) {
                            const ingredient = meal[`strIngredient${i}`];
                            const measure = meal[`strMeasure${i}`];
            
                            if (ingredient && ingredient.trim() !== "") {
                                // Append ingredients
                                const ingredientItem = document.createElement("li");
                                ingredientItem.textContent = ingredient;
                                ingredientsList.appendChild(ingredientItem);
            
                                // Append measures
                                const measureItem = document.createElement("li");
                                measureItem.textContent = measure ? measure : "N/A";
                                measureList.appendChild(measureItem);
                            }
                        }
                    })
                    .catch(error => {
                        detailsContainer.innerHTML = "<p>Error fetching meal details.</p>";
                        console.error("Error fetching meal details:", error);
                    });
            }
            

        


            // Function to go back to the meals list
            function goBack() {
                document.getElementById("mealDetails").style.display = "none";
                document.getElementById("results").style.display = "flex";
            }
            





            


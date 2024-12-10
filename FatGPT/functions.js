function calculateBMI(height, weight) {
  // 미터 단위로 변환
  const heightInMeters = height / 100;

  // BMI 계산
  const bmi = weight / (heightInMeters * heightInMeters);

  // 정상 BMI 범위에 따른 정상 몸무게 계산
  const normalWeightMin = (18.5 * (heightInMeters * heightInMeters)).toFixed(2);
  const normalWeightMax = (23 * (heightInMeters * heightInMeters)).toFixed(2);

  // 결과 반환
  return {
      bmi: parseFloat(bmi.toFixed(2)), // 소수점 2자리 BMI
      normalWeightRange: {
          min: parseFloat(normalWeightMin), // 정상 범위 최소 몸무게
          max: parseFloat(normalWeightMax), // 정상 범위 최대 몸무게
      },
  };
}

function calculateCalories(weight, goalWeight) {
    const baseCalories = weight * 24 * 1.2; // 현재 체중 기준 대사량
    const goalDifference = (goalWeight - weight) * 7700; // 목표 체중 차이
    const dailyCalorieAdjustment = goalDifference / 30; // 한 달 기준 조정값
  
    // 하루 칼로리 조정량 제한 (-300 ~ +300 kcal 범위)
    const adjustedCalories = Math.max(-300, Math.min(300, dailyCalorieAdjustment));
  
    // 권장 칼로리 계산
    const recommendedCalories = Math.round(baseCalories + adjustedCalories);
  
    return recommendedCalories; // 권장 칼로리 반환
  }
  

class Food {
  constructor(name, calories, category) {
    this.name = name; // 음식 이름
    this.calories = calories; // 칼로리
    this.category = category;
  }
}
class Categorizer {
  constructor() {
      this.categorized = {};
  }

  addFood(food) {
      const { calories, category } = food;
      if (!(category in this.categorized)) {
          this.categorized[category] = [];
      }
  
      const items = this.categorized[category];
      let inserted = false;
      for (let i = 0; i < items.length; i++) {
          if (items[i].calories > calories) {
              items.splice(i, 0, food); // 해당 위치에 삽입
              inserted = true;
              break;
          }
      }
  
      if (!inserted) {
          items.push(food); // 가장 뒤에 추가
      }
  }

  // 카테고리별 음식 추가된 상태를 반환
  getCategorizedFoods() {
      return this.categorized;
  }
}


function findMealCombination(categorizer, targetCalories) {
    const mainCarbs = categorizer.categorized["주식"] || [];
    const mainDishes = categorizer.categorized["메인반찬"] || [];
    const sideDishes = categorizer.categorized["사이드반찬"] || [];
    const soups = categorizer.categorized["국"] || [];
    const singleDishes = categorizer.categorized["단일음식"] || [];
    const desserts = categorizer.categorized["후식"] || [];

    let bestCombination = null;
    let closestToTarget = Infinity;

    for (const carb of mainCarbs) {
        for (const main of mainDishes) {
            for (const side of sideDishes) {
                for (const soup of soups) {
                    const baseCalories = carb.calories + main.calories + side.calories + soup.calories;

                    for (const dessert of [null, ...desserts]) {
                        const totalCalories = dessert ? baseCalories + dessert.calories : baseCalories;
                        const diffToTarget = Math.abs(targetCalories - totalCalories);

                        if (diffToTarget < closestToTarget) {
                            closestToTarget = diffToTarget;
                            bestCombination = {
                                combo: [carb, main, side, soup, dessert].filter(Boolean),
                                totalCalories,
                            };
                        }
                    }
                }
            }
        }
    }

    for (const single of singleDishes) {
        const singleCalories = single.calories;

        for (const dessert of [null, ...desserts]) {
            const totalCalories = dessert ? singleCalories + dessert.calories : singleCalories;
            const diffToTarget = Math.abs(targetCalories - totalCalories);

            if (diffToTarget < closestToTarget) {
                closestToTarget = diffToTarget;
                bestCombination = {
                    combo: [single, dessert].filter(Boolean),
                    totalCalories,
                };
            }
        }
    }

    return bestCombination;
}


function recommendDistinctMeals(categorizer, totalCalories) {
    const dailyMeals = [];
    let remainingCategorizer = JSON.parse(JSON.stringify(categorizer.categorized));
    let remainingCalories = totalCalories; // 남은 총 칼로리
    const mealRatios = [1 / 3, 1 / 3, 1 / 3]; // 기본 1:1:1 비율

    for (let i = 0; i < 3; i++) {
        // 현재 식사 타겟 칼로리 계산
        const targetCalories = Math.round(remainingCalories * mealRatios[i]);
        
        // 최적의 조합 찾기
        const bestCombination = findMealCombination({ categorized: remainingCategorizer }, targetCalories);

        if (bestCombination) {
            dailyMeals.push(bestCombination);

            // 실제 소비된 칼로리 반영하여 남은 칼로리 조정
            const actualCalories = bestCombination.totalCalories;
            remainingCalories -= actualCalories;

            // 사용한 음식 제거
            const usedFoods = bestCombination.combo;
            for (const food of usedFoods) {
                const category = food.category;
                const index = remainingCategorizer[category].findIndex((item) => item.name === food.name);

                if (index !== -1) {
                    remainingCategorizer[category].splice(index, 1);
                }
            }
        } else {
            break; // 더 이상 조합이 없으면 종료
        }
    }

    const [breakfast, lunch, dinner] = dailyMeals;
    return {
        breakfast: breakfast ? breakfast.combo : [],
        lunch: lunch ? lunch.combo : [],
        dinner: dinner ? dinner.combo : [],
    };
}



function recommend3Meals(categorizer, calorieRange) {
  const dailyMealPlan = recommendDistinctMeals(categorizer, calorieRange);
  localStorage.setItem("dailyMealPlan", JSON.stringify(dailyMealPlan));
}

function FoodsData() {
  const foodsData = JSON.parse(localStorage.getItem("Foods"));
  const categorizer = new Categorizer();

  // 로컬 스토리지에서 가져온 데이터 기반으로 각 음식 정보를 Categorizer에 추가
  foodsData.forEach(food => {
      categorizer.addFood(new Food(food.name, food.calories, food.category));
  });

  return categorizer;
}

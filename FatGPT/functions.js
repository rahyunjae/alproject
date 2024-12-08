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
  const recommendedCalories = baseCalories + adjustedCalories;

  // 범위 계산 (±10% 여유 범위)
  const minCalories = Math.round(recommendedCalories * 0.9);
  const maxCalories = Math.round(recommendedCalories * 1.1);

  return { min: minCalories, max: maxCalories }; // 범위 반환
}

class Food {
constructor(name, calories, category) {
  this.name = name; // 음식 이름
  this.calories = calories; // 칼로리
  this.category = category;
}
}
  // Categorizer 클래스 정의
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

  function findMealCombination(categorizer, calorieRange) {
    const { min: dailyMinCalories, max: dailyMaxCalories } = calorieRange;
  
    // 하루 목표 칼로리 범위의 3분의 1로 타깃 범위 설정
    const targetMinCalories = Math.round((dailyMinCalories / 3) * 0.9); // ±10% 여유
    const targetMaxCalories = Math.round((dailyMaxCalories / 3) * 1.1);
    const targetMid = (targetMinCalories + targetMaxCalories) / 2;
  
    const mainCarbs = categorizer.categorized["주식"] || [];
    const mainDishes = categorizer.categorized["메인반찬"] || [];
    const sideDishes = categorizer.categorized["사이드반찬"] || [];
    const soups = categorizer.categorized["국"] || [];
    const singleDishes = categorizer.categorized["단일음식"] || [];
    const desserts = categorizer.categorized["후식"] || [];
  
    let bestCombination = null;
    let closestToMid = Infinity;
  
    // 주식, 메인반찬, 사이드반찬, 국, 후식의 모든 조합 계산
    for (const carb of mainCarbs) {
      for (const main of mainDishes) {
        for (const side of sideDishes) {
          for (const soup of soups) {
            const baseCalories = carb.calories + main.calories + side.calories + soup.calories;
  
            // 후식을 포함하거나 포함하지 않는 모든 경우 계산
            for (const dessert of [null, ...desserts]) {
              const totalCalories = dessert ? baseCalories + dessert.calories : baseCalories;
  
              if (totalCalories >= targetMinCalories && totalCalories <= targetMaxCalories) {
                const diffToMid = Math.abs(targetMid - totalCalories);
                if (diffToMid < closestToMid) {
                  closestToMid = diffToMid;
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
    }
  
    // 단일음식 + 후식 조합 계산
    for (const single of singleDishes) {
      const singleCalories = single.calories;
  
      for (const dessert of [null, ...desserts]) {
        const totalCalories = dessert ? singleCalories + dessert.calories : singleCalories;
  
        if (totalCalories >= targetMinCalories && totalCalories <= targetMaxCalories) {
          const diffToMid = Math.abs(targetMid - totalCalories);
          if (diffToMid < closestToMid) {
            closestToMid = diffToMid;
            bestCombination = {
              combo: [single, dessert].filter(Boolean),
              totalCalories,
            };
          }
        }
      }
    }
  
    return bestCombination;
  }
  function recommendDistinctMeals(categorizer, calorieRange) {
    const dailyMeals = []; // 아침, 점심, 저녁 저장
    let remainingCategorizer = JSON.parse(JSON.stringify(categorizer.categorized)); // 깊은 복사로 음식 데이터 복제
  
    for (let i = 0; i < 3; i++) {
      const bestCombination = findMealCombination({ categorized: remainingCategorizer }, calorieRange);
  
      if (bestCombination) {
        dailyMeals.push(bestCombination);
  
        // 사용한 음식을 제외한 새로운 음식 리스트 생성
        const usedFoods = bestCombination.combo;
        for (const food of usedFoods) {
          const category = food.category;
          const index = remainingCategorizer[category].findIndex((item) => item.name === food.name);
  
          if (index !== -1) {
            remainingCategorizer[category].splice(index, 1); // 사용한 음식 제거
          }
        }
      } else {
        break; // 더 이상 조합을 만들 수 없으면 종료
      }
    }
  
    const [breakfast, lunch, dinner] = dailyMeals;
    return {
      breakfast: breakfast ? breakfast.combo : [],
      lunch: lunch ? lunch.combo : [],
      dinner: dinner ? dinner.combo : [],
    };
  }
  
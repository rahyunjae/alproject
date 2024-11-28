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
    this.category = category
  }
}

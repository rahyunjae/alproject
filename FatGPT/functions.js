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
  
  // CSV 파일 읽기 및 처리
  function handleFileUpload(event) {
    const file = event.target.files[0]; // 업로드된 파일 가져오기
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function(e) {
      const csvText = e.target.result;
      const rows = csvText.split('\n'); // 줄 단위로 나누기
      const data = rows.slice(1) // 첫 줄(헤더) 제거
                      .map(row => row.split(',')); // 쉼표로 나누어 배열로 변환
  
      // `Categorizer` 클래스와 `addFood` 함수 사용
      const categorizer = new Categorizer();
      data.forEach(row => {
        if (row.length >= 3) { // 데이터 유효성 확인
          const [name, calories, category] = row.map(item => item.trim());
          categorizer.addFood(new Food(name, parseFloat(calories), category));
        }
      });
  
      // 필요한 부분에서 Categorizer의 데이터를 사용할 수 있게 반환
      const categorizedFoods = categorizer.getCategorizedFoods();
      console.log(categorizedFoods); // 필요한 곳에서 사용
    };
  
    reader.readAsText(file); // 파일을 텍스트로 읽기
  }
  
  // 파일 업로드 이벤트 리스너
  document.getElementById('csv-upload').addEventListener('change', handleFileUpload);
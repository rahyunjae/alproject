// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 파일 업로드 이벤트 리스너 추가
    document.getElementById('csv-upload').addEventListener('change', handleFileUpload);
  });

  // 기존 JavaScript 코드 포함 (주어진 코드 그대로 사용)
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

      // Categorizer 데이터 저장
      window.categorizer = categorizer;
      alert("파일 업로드가 완료되었습니다.");
    };

    reader.readAsText(file); // 파일을 텍스트로 읽기
  }

  // 식사 추천 함수
function generateMealRecommendation() {
  const weight = parseFloat(document.getElementById('weight').value);
  const goalWeight = parseFloat(document.getElementById('goalWeight').value);
  if (isNaN(weight) || isNaN(goalWeight)) {
    alert("체중과 목표 체중을 입력하세요.");
    return;
  }

  // 하루 칼로리 범위 계산
  const calorieRange = calculateCalories(weight, goalWeight);

  // 식사 추천 조합 찾기
  if (window.categorizer) {
    const mealRecommendations = recommendDistinctMeals(window.categorizer, calorieRange);

    // 결과 출력
    const resultDiv = document.getElementById('meal-result');
    resultDiv.innerHTML = `
      <h3>추천 식사 조합</h3>
      <p><strong>아침:</strong> ${mealRecommendations.breakfast.map(item => item.name).join(", ")}</p>
      <p><strong>점심:</strong> ${mealRecommendations.lunch.map(item => item.name).join(", ")}</p>
      <p><strong>저녁:</strong> ${mealRecommendations.dinner.map(item => item.name).join(", ")}</p>
    `;
  } else {
    alert("먼저 CSV 파일을 업로드하세요.");
  }
}

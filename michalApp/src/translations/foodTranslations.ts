export const foodTranslations = {
  "egg": "jajko",
  "bread": "chleb",
  "chicken breast": "pierś z kurczaka",
  "pork": "wieprzowina",
  "beef": "wołowina",
  "rice": "ryż",
  "potato": "ziemniak",
  "milk": "mleko",
  "cheese": "ser",
  "yogurt": "jogurt",
  "apple": "jabłko",
  "banana": "banan",
  "tomato": "pomidor",
  "carrot": "marchewka",
  "salmon": "łosoś",
  "tuna": "tuńczyk",
  "oatmeal": "owsianka",
  "pasta": "makaron",
  "olive oil": "oliwa z oliwek",
  "butter": "masło"
};

// Funkcja pomocnicza do tłumaczenia
export const translateFood = (englishName: string): string => {
  return foodTranslations[englishName.toLowerCase()] || englishName;
};

// Funkcja do wyszukiwania podpowiedzi
export const getSuggestions = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  return Object.entries(foodTranslations)
    .filter(([eng, pl]) => 
      eng.toLowerCase().includes(lowerQuery) || 
      pl.toLowerCase().includes(lowerQuery)
    )
    .map(([eng, pl]) => `${pl} (${eng})`);
}; 
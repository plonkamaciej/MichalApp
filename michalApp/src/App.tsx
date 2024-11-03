import React, { useState, useEffect } from 'react';
import { Calendar } from './components/ui/calendar';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card';
import './App.css';
import { foodTranslations, getSuggestions } from './translations/foodTranslations';

interface Meal {
  name: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  weight: number;
}

interface PredefinedMeal {
  name: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
}

interface DailyMeals {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
}

interface DailyEntry {
  date: string;
  meals: DailyMeals;
  totalCalories: number;
}

interface APIFood {
  id: string | null;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weight: number;
  meal: null;
}

interface MacroGoals {
  protein: number;
  carbs: number;
  fat: number;
}

const predefinedMeals: PredefinedMeal[] = [
  { name: "Jajecznica", protein: 13, fat: 11, carbs: 1, calories: 156 },
  { name: "Owsianka", protein: 13, fat: 5, carbs: 67, calories: 371 },
  { name: "Pierś z kurczaka", protein: 31, fat: 3.6, carbs: 0, calories: 165 },
  { name: "Łosoś", protein: 20, fat: 13, carbs: 0, calories: 208 },
  { name: "Sałatka grecka", protein: 2.5, fat: 16, carbs: 4, calories: 168 },
];

function DateSelector({ selectedDate, onDateChange }: { selectedDate: string, onDateChange: (date: string) => void }) {
  return (
    <input 
      type="date" 
      value={selectedDate} 
      onChange={(e) => onDateChange(e.target.value)}
      style={{ margin: '10px 0', padding: '5px' }}
    />
  );
}

function MealForm({ addMeal }: { addMeal: (meal: Meal) => void }) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<APIFood | null>(null);
  const [weight, setWeight] = useState<number>(100);

  // Obsługa podpowiedzi
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSuggestions(getSuggestions(searchQuery));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const searchFoods = async (query: string) => {
    if (!query) {
      return;
    }
    try {
      // Wyciągnij angielską nazwę z formatu "nazwa_pl (nazwa_eng)"
      const englishName = query.match(/\((.*?)\)$/)?.[1] || query;
      const response = await fetch(`http://localhost:8081/api/foods/search/${englishName}`);
      const data = await response.json();
      if (data) {
        const foodWithId = {
          ...data,
          id: data.id || `temp-${Date.now()}`
        };
        setSelectedFood(foodWithId);
      }
    } catch (error) {
      console.error('Błąd podczas wyszukiwania:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFood) {
      const factor = weight / 100;
      const newMeal: Meal = {
        name: selectedFood.name,
        protein: Math.round(selectedFood.protein * factor * 10) / 10,
        fat: Math.round(selectedFood.fat * factor * 10) / 10,
        carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
        calories: Math.round(selectedFood.calories * factor),
        weight: weight
      };
      addMeal(newMeal);
      setSelectedFood(null);
      setWeight(100);
      setSearchQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Wyszukaj posiłek..."
          className="w-full"
        />
        
        {/* Lista podpowiedzi */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSearchQuery(suggestion);
                  setSuggestions([]);
                  searchFoods(suggestion);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      <Input 
        type="number" 
        value={weight} 
        onChange={(e) => setWeight(Number(e.target.value))} 
        placeholder="Waga (g)" 
      />
      
      <Button 
        type="submit" 
        disabled={!selectedFood}
        className="w-full"
      >
        Dodaj posiłek
      </Button>
      
      {selectedFood && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium">Wartości odżywcze na 100g:</p>
          <div className="space-y-1 mt-2">
            <p>Białko: {selectedFood.protein}g</p>
            <p>Tłuszcz: {selectedFood.fat}g</p>
            <p>Węglowodany: {selectedFood.carbs}g</p>
            <p>Kalorie: {selectedFood.calories}kcal</p>
          </div>
        </div>
      )}
    </form>
  );
}

function MealList({ meals }: { meals: Meal[] }) {
  const totalNutrients = meals.reduce((acc, meal) => ({
    protein: acc.protein + meal.protein,
    fat: acc.fat + meal.fat,
    carbs: acc.carbs + meal.carbs,
    calories: acc.calories + meal.calories
  }), { protein: 0, fat: 0, carbs: 0, calories: 0 });

  return (
    <div>
      <ul>
        {meals.map((meal, index) => (
          <li key={index}>
            {meal.name} ({meal.weight}g) - Białko: {meal.protein}g, Tłuszcz: {meal.fat}g, Węglowodany: {meal.carbs}g, Kalorie: {meal.calories}kcal
          </li>
        ))}
      </ul>
      <div>
        <strong>Suma:</strong> Białko: {Math.round(totalNutrients.protein * 10) / 10}g, Tłuszcz: {Math.round(totalNutrients.fat * 10) / 10}g, 
        Węglowodany: {Math.round(totalNutrients.carbs * 10) / 10}g, Kalorie: {Math.round(totalNutrients.calories)}kcal
      </div>
    </div>
  );
}

function MealSection({ title, meals, addMeal }: { title: string, meals: Meal[], addMeal: (meal: Meal) => void }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <MealForm addMeal={addMeal} />
      </CardContent>
      <CardFooter>
        <MealList meals={meals} />
      </CardFooter>
    </Card>
  );
}

function CaloryGoalSetter({ goal, setGoal }: { goal: number, setGoal: (goal: number) => void }) {
  const [tempGoal, setTempGoal] = useState(goal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoal(tempGoal);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input 
        type="number" 
        value={tempGoal} 
        onChange={(e) => setTempGoal(Number(e.target.value))}
        placeholder="Cel kaloryczny"
      />
      <Button type="submit">Ustaw cel</Button>
    </form>
  );
}

function MacroGoalSetter({ goals, setGoals }: { 
  goals: MacroGoals, 
  setGoals: (goals: MacroGoals) => void 
}) {
  const [tempGoals, setTempGoals] = useState(goals);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals(tempGoals);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Białko (g)</label>
          <Input 
            type="number" 
            value={tempGoals.protein} 
            onChange={(e) => setTempGoals({...tempGoals, protein: Number(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Węglowodany (g)</label>
          <Input 
            type="number" 
            value={tempGoals.carbs} 
            onChange={(e) => setTempGoals({...tempGoals, carbs: Number(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tłuszcze (g)</label>
          <Input 
            type="number" 
            value={tempGoals.fat} 
            onChange={(e) => setTempGoals({...tempGoals, fat: Number(e.target.value)})}
          />
        </div>
      </div>
      <Button type="submit">Ustaw cele makroskładników</Button>
    </form>
  );
}

function ActivityCalendar({ entries, caloryGoal, onDateSelect, selectedDate }: { 
  entries: DailyEntry[], 
  caloryGoal: number,
  onDateSelect: (date: Date) => void,
  selectedDate: string
}) {
  const getDayColor = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    
    const isSelected = dateStr === selectedDate;
    
    if (isSelected) {
      return 'bg-blue-300 font-bold';
    } else if (entry) {
      return entry.totalCalories <= caloryGoal ? 'bg-green-200' : 'bg-red-200';
    }
    return '';
  };

  return (
    <div className="flex justify-center">
      <Calendar 
        mode="single"
        onSelect={(date) => {
          if (date) {
            const localDate = new Date(date.setHours(12, 0, 0, 0));
            onDateSelect(localDate);
          }
        }}
        selected={new Date(selectedDate)}
        modifiers={{
          customColor: (date) => getDayColor(date) !== '',
        }}
        modifiersClassNames={{
          customColor: (date: Date) => getDayColor(date) as string,
        }}
        className="border rounded-md p-4"
      />
    </div>
  );
}

function ProgressBar({ current, goal, label, color = "bg-blue-500" }: { 
  current: number; 
  goal: number; 
  label: string;
  color?: string;
}) {
  const percentage = Math.min((current / goal) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{Math.round(current * 10) / 10}g / {goal}g</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-sm text-gray-500">
        {Math.round(percentage)}%
      </div>
    </div>
  );
}

function App() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [caloryGoal, setCaloryGoal] = useState<number>(2000);
  const [macroGoals, setMacroGoals] = useState<MacroGoals>({
    protein: 150,
    carbs: 200,
    fat: 70
  });

  useEffect(() => {
    const storedEntries = localStorage.getItem('diaryEntries');
    const storedGoal = localStorage.getItem('caloryGoal');
    const storedMacroGoals = localStorage.getItem('macroGoals');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
    if (storedGoal) {
      setCaloryGoal(Number(storedGoal));
    }
    if (storedMacroGoals) {
      setMacroGoals(JSON.parse(storedMacroGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('caloryGoal', caloryGoal.toString());
  }, [caloryGoal]);

  useEffect(() => {
    localStorage.setItem('macroGoals', JSON.stringify(macroGoals));
  }, [macroGoals]);

  const getCurrentEntry = () => {
    return entries.find(entry => entry.date === selectedDate) || {
      date: selectedDate,
      meals: { breakfast: [], lunch: [], dinner: [] },
      totalCalories: 0
    };
  };

  const addMeal = (mealType: keyof DailyMeals, meal: Meal) => {
    setEntries(prevEntries => {
      const currentEntry = getCurrentEntry();
      const updatedEntry = {
        ...currentEntry,
        meals: {
          ...currentEntry.meals,
          [mealType]: [...currentEntry.meals[mealType], meal]
        },
        totalCalories: currentEntry.totalCalories + meal.calories
      };
      const newEntries = prevEntries.filter(entry => entry.date !== selectedDate);
      return [...newEntries, updatedEntry];
    });
  };

  const calculateDailyTotals = () => {
    const currentEntry = getCurrentEntry();
    const allMeals = [
      ...currentEntry.meals.breakfast,
      ...currentEntry.meals.lunch,
      ...currentEntry.meals.dinner
    ];

    return allMeals.reduce((acc, meal) => ({
      protein: acc.protein + meal.protein,
      fat: acc.fat + meal.fat,
      carbs: acc.carbs + meal.carbs,
      calories: acc.calories + meal.calories
    }), { protein: 0, fat: 0, carbs: 0, calories: 0 });
  };

  const currentEntry = getCurrentEntry();
  const dailyTotals = calculateDailyTotals();

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dziennik Jedzenia</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Ustawienia celów</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Cel kaloryczny</h3>
            <CaloryGoalSetter goal={caloryGoal} setGoal={setCaloryGoal} />
          </div>
          <div>
            <h3 className="font-medium mb-2">Cele makroskładników</h3>
            <MacroGoalSetter goals={macroGoals} setGoals={setMacroGoals} />
          </div>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Kalendarz aktywności</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityCalendar 
            entries={entries} 
            caloryGoal={caloryGoal} 
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
          <div className="mt-4 text-center text-sm text-gray-600">
            Wybrana data: {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pl-PL')}
          </div>
        </CardContent>
      </Card>
      <MealSection title="Śniadanie" meals={currentEntry.meals.breakfast} addMeal={(meal) => addMeal('breakfast', meal)} />
      <MealSection title="Obiad" meals={currentEntry.meals.lunch} addMeal={(meal) => addMeal('lunch', meal)} />
      <MealSection title="Kolacja" meals={currentEntry.meals.dinner} addMeal={(meal) => addMeal('dinner', meal)} />
      <Card>
        <CardHeader>
          <CardTitle>Podsumowanie dnia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Kalorie */}
            <ProgressBar
              current={dailyTotals.calories}
              goal={caloryGoal}
              label="Kalorie (kcal)"
              color="bg-purple-500"
            />

            {/* Białko */}
            <ProgressBar
              current={dailyTotals.protein}
              goal={macroGoals.protein}
              label="Białko"
              color="bg-red-500"
            />

            {/* Węglowodany */}
            <ProgressBar
              current={dailyTotals.carbs}
              goal={macroGoals.carbs}
              label="Węglowodany"
              color="bg-green-500"
            />

            {/* Tłuszcze */}
            <ProgressBar
              current={dailyTotals.fat}
              goal={macroGoals.fat}
              label="Tłuszcze"
              color="bg-yellow-500"
            />

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
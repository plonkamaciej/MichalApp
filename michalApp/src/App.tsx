import React, { useState, useEffect } from 'react';
import { Calendar } from './components/ui/calendar';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card';
import './App.css';

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
  const [selectedMeal, setSelectedMeal] = useState<PredefinedMeal | null>(null);
  const [weight, setWeight] = useState<number>(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeal) {
      const factor = weight / 100;
      const newMeal: Meal = {
        name: selectedMeal.name,
        protein: Math.round(selectedMeal.protein * factor * 10) / 10,
        fat: Math.round(selectedMeal.fat * factor * 10) / 10,
        carbs: Math.round(selectedMeal.carbs * factor * 10) / 10,
        calories: Math.round(selectedMeal.calories * factor),
        weight: weight
      };
      addMeal(newMeal);
      setSelectedMeal(null);
      setWeight(100);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select onValueChange={(value) => setSelectedMeal(predefinedMeals.find(meal => meal.name === value) || null)}>
        <SelectTrigger>
          <SelectValue placeholder="Wybierz danie" />
        </SelectTrigger>
        <SelectContent>
          {predefinedMeals.map(meal => (
            <SelectItem key={meal.name} value={meal.name}>{meal.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input 
        type="number" 
        value={weight} 
        onChange={(e) => setWeight(Number(e.target.value))} 
        placeholder="Waga (g)" 
      />
      <Button type="submit" disabled={!selectedMeal}>Dodaj posiłek</Button>
      {selectedMeal && (
        <div>
          <p>Wartości odżywcze na 100g:</p>
          <p>Białko: {selectedMeal.protein}g, Tłuszcz: {selectedMeal.fat}g, Węglowodany: {selectedMeal.carbs}g, Kalorie: {selectedMeal.calories}kcal</p>
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

function ActivityCalendar({ entries, caloryGoal }: { entries: DailyEntry[], caloryGoal: number }) {
  const getDayColor = (date: Date) => {
    const entry = entries.find(e => e.date === date.toISOString().split('T')[0]);
    if (entry) {
      return entry.totalCalories <= caloryGoal ? 'bg-green-200' : 'bg-red-200';
    }
    return '';
  };

  return (
    <Calendar 
      mode="single"
      modifiers={{
        customColor: (date) => getDayColor(date) !== '',
      }}
      modifiersClassNames={{
        customColor: (date: Date) => getDayColor(date) as string,
      }}
    />
  );
}

function App() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [caloryGoal, setCaloryGoal] = useState<number>(2000);

  useEffect(() => {
    const storedEntries = localStorage.getItem('diaryEntries');
    const storedGoal = localStorage.getItem('caloryGoal');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
    if (storedGoal) {
      setCaloryGoal(Number(storedGoal));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('caloryGoal', caloryGoal.toString());
  }, [caloryGoal]);

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

  const currentEntry = getCurrentEntry();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dziennik Jedzenia</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Ustawienia</CardTitle>
        </CardHeader>
        <CardContent>
          <CaloryGoalSetter goal={caloryGoal} setGoal={setCaloryGoal} />
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Kalendarz aktywności</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityCalendar entries={entries} caloryGoal={caloryGoal} />
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Wybierz datę</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
          />
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
          <p>Całkowita liczba kalorii: {currentEntry.totalCalories}</p>
          <p>Cel kaloryczny: {caloryGoal}</p>
          <p>Status: {currentEntry.totalCalories <= caloryGoal ? 'Zjedzono za mało kalorii!' : 'Osiągnięto cel!'}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
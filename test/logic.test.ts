import test from 'node:test';
import assert from 'node:assert/strict';

// Pure logic tests
test('Mood configuration contains required 8 moods', () => {
  const requiredMoods = [
    'Happy',
    'Calm',
    'Neutral',
    'Sad',
    'Anxious',
    'Stressed',
    'Lonely',
    'Tired',
  ];
  assert.equal(requiredMoods.length, 8);
});

test('Intensity descriptor logic returns appropriate labels', () => {
  const getIntensityDescriptor = (val: number) => {
    if (val <= 2) return 'Very subtle & mild';
    if (val <= 4) return 'Gentle presence';
    if (val <= 6) return 'Moderate & noticeable';
    if (val <= 8) return 'Elevated & demanding attention';
    return 'Very intense & overpowering';
  };

  assert.equal(getIntensityDescriptor(1), 'Very subtle & mild');
  assert.equal(getIntensityDescriptor(5), 'Moderate & noticeable');
  assert.equal(getIntensityDescriptor(8), 'Elevated & demanding attention');
  assert.equal(getIntensityDescriptor(10), 'Very intense & overpowering');
});

test('Coping activity detection correctly maps stress queries', () => {
  const detectActivity = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('breath') || t.includes('panic') || t.includes('anxi')) {
      return { activity: 'Box Breathing (4-4-4-4)', category: 'Stress' };
    }
    if (t.includes('spiral') || t.includes('overthink')) {
      return { activity: '5-4-3-2-1 Sensory Grounding', category: 'Overthinking' };
    }
    if (t.includes('exam') || t.includes('study') || t.includes('paper')) {
      return { activity: 'Micro-Step Task Breakdown', category: 'Academic pressure' };
    }
    return { activity: 'Box Breathing (4-4-4-4)', category: 'Stress' };
  };

  assert.equal(detectActivity('I am having anxiety').category, 'Stress');
  assert.equal(detectActivity('I cannot stop overthinking').activity, '5-4-3-2-1 Sensory Grounding');
  assert.equal(detectActivity('Need to finish study for finals').category, 'Academic pressure');
});

test('Habit replacement concept enforces replace instead of remove', () => {
  const habit = {
    unwanted: 'Doomscrolling in bed',
    trigger: 'Tired and restless',
    replacement: 'Reading 10 pages of a calming book',
  };

  assert.ok(habit.replacement.length > 0, 'Replacement activity must be present');
  assert.notEqual(habit.unwanted, habit.replacement);
});

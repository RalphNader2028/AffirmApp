import AsyncStorage from '@react-native-async-storage/async-storage';

const AFFIRMATIONS_DB = {
  motivation: [
    "Excuses are for losers. Pick one task and crush it NOW.",
    "You're not tired—you're weak. Get up and move toward your goal.",
    "Nobody's coming to save you. Own your shit and make it happen.",
    "Stop overthinking. Act fast, fail fast, win fast.",
    "You're tougher than your excuses. Prove it today.",
    "Hard work isn't optional—it's your duty. Get to it.",
    "Your goals don't care about your feelings. Grind anyway.",
    "Quit whining. Every second you waste, someone's outworking you.",
    "Be the man you'd respect. No shortcuts, no bullshit.",
    "You're built for this. Stop doubting and start doing.",
    "Comfort is the enemy of greatness. Choose discomfort.",
    "Your future self is judging your current actions. Don't disappoint him.",
    "Mediocrity is a choice. Choose excellence instead.",
    "Stop waiting for motivation. Discipline is what gets shit done.",
    "Your competition is working while you're scrolling. Get back to work.",
    "Pain is temporary. Quitting lasts forever.",
    "You don't need perfect conditions. You need relentless action.",
    "Stop making plans. Start making moves.",
    "Your comfort zone is a prison. Break out and stay out.",
    "Winners don't wait for Monday. They start now.",
    "Every excuse you make is a step backward. Stop stepping backward.",
    "You're either growing or dying. There's no middle ground.",
    "Successful people do what unsuccessful people won't do.",
    "Your problems are not unique. Your solutions need to be.",
    "Stop talking about what you're going to do. Do it.",
    "The grind doesn't stop because you're tired.",
    "You're not behind. You're exactly where your effort has put you.",
    "Champions are made when nobody's watching.",
    "Your potential means nothing without execution.",
    "Stop looking for shortcuts. There aren't any."
  ],
  confidence: [
    "Confidence isn't given—it's earned through action. Go earn it.",
    "Stop asking for permission. You already know what needs doing.",
    "Your opinion of yourself is the only one that matters. Make it count.",
    "Weak people seek validation. Strong people create results.",
    "You don't need anyone's approval to be great. Start now.",
    "Self-doubt is self-sabotage. Cut that shit out immediately.",
    "Champions don't wait to feel ready. They make themselves ready.",
    "Your comfort zone is a prison. Break out and stay out.",
    "Stop playing small. The world needs what you've got.",
    "Confidence comes from competence. Get competent, get confident.",
    "You're not an imposter. You're just getting started.",
    "Stop apologizing for taking up space. You belong here.",
    "Your voice matters. Use it or lose the right to complain.",
    "Confidence is built one bold action at a time.",
    "You're not too young, too old, or too anything. You're ready.",
    "Stop waiting for someone to believe in you. Believe in yourself.",
    "Your past doesn't define your future. Your actions do.",
    "You're not lucky. You're prepared meeting opportunity.",
    "Stop dimming your light to make others comfortable.",
    "You're not arrogant for knowing your worth.",
    "Confidence isn't about being perfect. It's about being real.",
    "You don't need to be the smartest person in the room. Just the most prepared.",
    "Your insecurities are not facts. They're fears.",
    "Stop comparing your behind-the-scenes to everyone's highlight reel.",
    "You're not competing with anyone but yesterday's version of yourself.",
    "Confidence is quiet. Insecurity is loud.",
    "You're not responsible for other people's opinions of you.",
    "Stop shrinking to fit into spaces that weren't built for you.",
    "Your confidence threatens people who lack it. That's their problem.",
    "You're not here to be liked. You're here to be respected."
  ],
  success: [
    "Success isn't luck—it's relentless execution. Execute now.",
    "Winners do what losers won't. Which one are you today?",
    "Your competition is working while you're making excuses.",
    "Success demands sacrifice. What are you willing to give up?",
    "Average is the enemy of great. Choose your side.",
    "Results don't lie. Your effort shows in your outcomes.",
    "Success is earned in the dark when nobody's watching.",
    "Stop talking about it. Start being about it.",
    "Your future self is counting on today's decisions. Don't let him down.",
    "Excellence isn't an accident—it's a daily choice. Choose it.",
    "Success is not a destination. It's a way of traveling.",
    "You don't get what you wish for. You get what you work for.",
    "Success is the sum of small efforts repeated daily.",
    "The price of success is paid in advance through preparation.",
    "Success is not about being the best. It's about being better than you were yesterday.",
    "You can't have a million dollar dream with a minimum wage work ethic.",
    "Success is not final. Failure is not fatal. It's the courage to continue that counts.",
    "The road to success is always under construction.",
    "Success is not about the destination. It's about who you become on the journey.",
    "You don't have to be great to get started, but you have to get started to be great.",
    "Success is not measured by what you accomplish, but by the obstacles you overcome.",
    "The difference between successful people and others is not a lack of strength or knowledge, but a lack of will.",
    "Success is not about being perfect. It's about being persistent.",
    "You can't climb the ladder of success with your hands in your pockets.",
    "Success is not about how fast you get there. It's about how long you stay there.",
    "The successful person is the one who can build a firm foundation with the bricks others have thrown at them.",
    "Success is not about avoiding failure. It's about learning from it.",
    "You don't succeed because you're destined to. You succeed because you're determined to.",
    "Success is not about being lucky. It's about being ready when opportunity knocks.",
    "The price of success is much lower than the price of regret."
  ],
  gratitude: [
    "Gratitude without action is just empty words. Show your thanks through work.",
    "You've got more than most. Stop complaining and start contributing.",
    "Every breath is borrowed time. Make each one count.",
    "Appreciate what you have by maximizing what you do with it.",
    "Gratitude means using your gifts, not wasting them.",
    "You're alive, healthy, and capable. That's enough—now move.",
    "Stop taking your advantages for granted. Leverage them.",
    "Your problems are privileges compared to real struggle. Perspective check.",
    "Thankfulness is shown through effort, not words.",
    "You've been given tools. Use them or lose the right to complain.",
    "Gratitude is not about what you have. It's about what you do with what you have.",
    "You're not grateful if you're not growing.",
    "Appreciation without application is just lip service.",
    "You're blessed with opportunities. Don't waste them on excuses.",
    "Gratitude is an action word. What are you doing about it?",
    "You have access to more resources than 99% of humans who ever lived. Use them.",
    "Your biggest problems would be someone else's biggest dreams.",
    "Stop focusing on what you lack. Start maximizing what you have.",
    "Gratitude is not a feeling. It's a practice.",
    "You're not entitled to anything. Everything is earned.",
    "Your advantages are not accidents. They're responsibilities.",
    "Gratitude without growth is just comfort.",
    "You're not grateful if you're not generous with your gifts.",
    "Appreciation is shown through acceleration, not celebration.",
    "You have more tools than excuses. Use the tools.",
    "Gratitude is measured by output, not input.",
    "You're not thankful if you're not thoughtful about your actions.",
    "Your blessings are not for hoarding. They're for sharing.",
    "Gratitude is not about counting your blessings. It's about making your blessings count.",
    "You're not grateful if you're not great-full of purpose."
  ],
  peace: [
    "Peace comes from knowing you gave everything you had.",
    "Control what you can, ignore what you can't. Simple.",
    "Inner peace is earned through outer discipline.",
    "Chaos outside means nothing if you're solid inside.",
    "Peace isn't the absence of problems—it's mastery over them.",
    "Calm minds make better decisions. Stay sharp, stay focused.",
    "Your energy is finite. Don't waste it on things you can't change.",
    "Peace through strength. Build both daily.",
    "Serenity comes from accepting responsibility, not avoiding it.",
    "Master yourself first. Everything else becomes manageable.",
    "Peace is not a destination. It's a way of traveling.",
    "You can't control the storm, but you can control your response to it.",
    "Inner peace is not about having a perfect life. It's about having a perfect perspective.",
    "Peace is not about avoiding conflict. It's about resolving it.",
    "You can't find peace by avoiding life. You find it by living it fully.",
    "Peace is not the absence of noise. It's the presence of focus.",
    "You don't need perfect conditions to have inner peace. You need perfect commitment.",
    "Peace is not about being passive. It's about being purposeful.",
    "You can't control other people's actions, but you can control your reactions.",
    "Peace is not about having no problems. It's about having no doubt in your ability to solve them.",
    "Inner peace is not about being comfortable. It's about being confident.",
    "You can't have peace without purpose.",
    "Peace is not about avoiding responsibility. It's about embracing it.",
    "You don't find peace by running from your problems. You find it by running toward your solutions.",
    "Peace is not about being perfect. It's about being present.",
    "You can't have inner peace without inner strength.",
    "Peace is not about having all the answers. It's about being comfortable with the questions.",
    "You don't need external validation to have internal peace.",
    "Peace is not about avoiding challenges. It's about conquering them.",
    "Inner peace is the ultimate form of self-respect."
  ],
  discipline: [
    "Discipline is choosing between what you want now and what you want most.",
    "You don't need motivation when you have discipline.",
    "Discipline is the bridge between goals and accomplishment.",
    "Self-discipline is self-respect in action.",
    "Discipline is doing what needs to be done, even when you don't want to do it.",
    "You can't have freedom without discipline.",
    "Discipline is the foundation of all success.",
    "Self-discipline is the ability to make yourself do what you should do, when you should do it, whether you feel like it or not.",
    "Discipline is the soul of an army. It makes small numbers formidable.",
    "You don't get disciplined. You become disciplined.",
    "Discipline is the refining fire by which talent becomes ability.",
    "Self-discipline is the magic power that makes you virtually unstoppable.",
    "Discipline is choosing between what you want now and what you want most.",
    "You can't have a disciplined life without disciplined thoughts.",
    "Discipline is the bridge between thought and accomplishment.",
    "Self-discipline is the ability to do what you should do, when you should do it, whether you feel like it or not.",
    "Discipline is the foundation upon which all success is built.",
    "You don't need to be perfect. You need to be disciplined.",
    "Discipline is not about restriction. It's about freedom.",
    "Self-discipline is the key to unlocking your potential.",
    "Discipline is doing what you hate to do, but doing it like you love it.",
    "You can't have discipline without sacrifice.",
    "Discipline is the difference between what you want and what you get.",
    "Self-discipline is the ability to control your impulses, emotions, and behaviors.",
    "Discipline is not a punishment. It's a privilege.",
    "You don't get what you want. You get what you're disciplined enough to pursue.",
    "Discipline is the mother of all virtues.",
    "Self-discipline is the ability to make yourself do things you don't want to do.",
    "Discipline is the price you pay for freedom.",
    "You can't have success without discipline. But you can have discipline without success."
  ],
  focus: [
    "Focus is not about doing more. It's about doing what matters.",
    "You can't hit a target you can't see. Get focused.",
    "Focus is the art of knowing what to ignore.",
    "Concentration is the secret of strength in politics, in war, in trade, in short in all management of human affairs.",
    "Focus on being productive instead of busy.",
    "You can't be everything to everyone. Focus on being something to someone.",
    "Focus is about saying no to the hundred other good ideas.",
    "The successful warrior is the average person with laser-like focus.",
    "Focus is the ultimate power. It's the ability to concentrate on one thing at a time.",
    "You can't do everything, but you can do anything if you focus.",
    "Focus is not about perfection. It's about progress.",
    "The art of being wise is knowing what to overlook.",
    "Focus is the key to achieving anything worthwhile.",
    "You can't multitask your way to success. You have to focus your way there.",
    "Focus is about eliminating distractions, not adding more tasks.",
    "The ability to focus and to concentrate is among the most important skills you can develop.",
    "Focus is not about doing one thing. It's about doing the right thing.",
    "You can't have focus without clarity.",
    "Focus is the difference between knowing the path and walking the path.",
    "The power of focus is the power to achieve anything.",
    "Focus is not about being busy. It's about being effective.",
    "You can't have success without focus. But you can have focus without success.",
    "Focus is the ability to think about one thing for a long time.",
    "The focused mind is the productive mind.",
    "Focus is not about doing more. It's about doing better.",
    "You can't hit two targets with one arrow. Focus on one.",
    "Focus is the foundation of all achievement.",
    "The power of concentration is the only key to the treasure-house of knowledge.",
    "Focus is not about perfection. It's about persistence.",
    "You can't have focus without purpose."
  ],
  resilience: [
    "Resilience is not about avoiding the storm. It's about learning to dance in the rain.",
    "You're not broken. You're breaking through.",
    "Resilience is the ability to bounce back stronger than before.",
    "You can't control what happens to you, but you can control how you respond.",
    "Resilience is not about being tough. It's about being flexible.",
    "You don't get stronger by avoiding challenges. You get stronger by facing them.",
    "Resilience is the difference between giving up and getting up.",
    "You can't have resilience without resistance.",
    "Resilience is not about never falling. It's about always getting back up.",
    "You're not a victim of your circumstances. You're a product of your decisions.",
    "Resilience is the ability to adapt and overcome.",
    "You can't have growth without struggle.",
    "Resilience is not about being perfect. It's about being persistent.",
    "You don't get resilient by avoiding problems. You get resilient by solving them.",
    "Resilience is the foundation of all success.",
    "You can't control the waves, but you can learn to surf.",
    "Resilience is not about being strong. It's about being smart.",
    "You don't get tough by avoiding tough times. You get tough by going through them.",
    "Resilience is the ability to turn setbacks into comebacks.",
    "You can't have resilience without courage.",
    "Resilience is not about never failing. It's about never giving up.",
    "You don't get resilient by avoiding pain. You get resilient by processing it.",
    "Resilience is the difference between surviving and thriving.",
    "You can't have resilience without hope.",
    "Resilience is not about being invincible. It's about being unstoppable.",
    "You don't get strong by avoiding weakness. You get strong by acknowledging it.",
    "Resilience is the ability to find opportunity in adversity.",
    "You can't have resilience without faith.",
    "Resilience is not about being perfect. It's about being real.",
    "You don't get resilient by avoiding reality. You get resilient by facing it."
  ]
};

const ALL_AFFIRMATIONS = Object.values(AFFIRMATIONS_DB).flat();

class AffirmationsService {
  private readonly RECENT_AFFIRMATIONS_KEY = 'recentAffirmations';
  private readonly MAX_RECENT_AFFIRMATIONS = 100; // Track last 100 affirmations to avoid repeats

  async getTodayAffirmation(): Promise<string> {
    try {
      const today = new Date().toDateString();
      const storedAffirmation = await AsyncStorage.getItem(`todayAffirmation_${today}`);
      
      if (storedAffirmation) {
        return storedAffirmation;
      }
      
      // Generate a new affirmation for today
      const randomIndex = Math.floor(Math.random() * ALL_AFFIRMATIONS.length);
      const todayAffirmation = ALL_AFFIRMATIONS[randomIndex];
      
      await AsyncStorage.setItem(`todayAffirmation_${today}`, todayAffirmation);
      await this.updateStreak();
      
      return todayAffirmation;
    } catch (error) {
      console.error('Error getting today affirmation:', error);
      return "Stop making excuses. You know what needs to be done.";
    }
  }

  async getAffirmationsByCategory(category: string): Promise<string[]> {
    if (category === 'all') {
      // Get fresh affirmations that haven't been shown recently
      return await this.getFreshAffirmations(20); // Get 20 fresh affirmations
    }
    return AFFIRMATIONS_DB[category as keyof typeof AFFIRMATIONS_DB] || [];
  }

  private async getFreshAffirmations(count: number): Promise<string[]> {
    try {
      // Get recently shown affirmations
      const recentAffirmationsJson = await AsyncStorage.getItem(this.RECENT_AFFIRMATIONS_KEY);
      const recentAffirmations: string[] = recentAffirmationsJson ? JSON.parse(recentAffirmationsJson) : [];
      
      // Filter out recently shown affirmations
      const availableAffirmations = ALL_AFFIRMATIONS.filter(
        affirmation => !recentAffirmations.includes(affirmation)
      );
      
      // If we don't have enough fresh affirmations, reset the recent list and use all
      let affirmationsToUse = availableAffirmations;
      if (availableAffirmations.length < count) {
        console.log('Not enough fresh affirmations, resetting recent list');
        affirmationsToUse = ALL_AFFIRMATIONS;
        await AsyncStorage.removeItem(this.RECENT_AFFIRMATIONS_KEY);
      }
      
      // Shuffle and get the requested count
      const shuffled = affirmationsToUse.sort(() => 0.5 - Math.random());
      const selectedAffirmations = shuffled.slice(0, count);
      
      // Update recent affirmations list
      await this.updateRecentAffirmations(selectedAffirmations);
      
      return selectedAffirmations;
    } catch (error) {
      console.error('Error getting fresh affirmations:', error);
      // Fallback to random selection
      return ALL_AFFIRMATIONS.sort(() => 0.5 - Math.random()).slice(0, count);
    }
  }

  private async updateRecentAffirmations(newAffirmations: string[]): Promise<void> {
    try {
      const recentAffirmationsJson = await AsyncStorage.getItem(this.RECENT_AFFIRMATIONS_KEY);
      let recentAffirmations: string[] = recentAffirmationsJson ? JSON.parse(recentAffirmationsJson) : [];
      
      // Add new affirmations to the recent list
      recentAffirmations = [...recentAffirmations, ...newAffirmations];
      
      // Keep only the most recent ones (up to MAX_RECENT_AFFIRMATIONS)
      if (recentAffirmations.length > this.MAX_RECENT_AFFIRMATIONS) {
        recentAffirmations = recentAffirmations.slice(-this.MAX_RECENT_AFFIRMATIONS);
      }
      
      await AsyncStorage.setItem(this.RECENT_AFFIRMATIONS_KEY, JSON.stringify(recentAffirmations));
    } catch (error) {
      console.error('Error updating recent affirmations:', error);
    }
  }

  async getFavorites(): Promise<number[]> {
    try {
      const favorites = await AsyncStorage.getItem('favoriteAffirmations');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  async toggleFavorite(index: number): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const favoriteSet = new Set(favorites);
      
      if (favoriteSet.has(index)) {
        favoriteSet.delete(index);
      } else {
        favoriteSet.add(index);
      }
      
      await AsyncStorage.setItem('favoriteAffirmations', JSON.stringify([...favoriteSet]));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  async getUserStreak(): Promise<number> {
    try {
      const streak = await AsyncStorage.getItem('userStreak');
      return streak ? parseInt(streak, 10) : 0;
    } catch (error) {
      console.error('Error getting user streak:', error);
      return 0;
    }
  }

  async markTodayCompleted(): Promise<void> {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`dayCompleted_${today}`, 'true');
      await this.updateStreak();
    } catch (error) {
      console.error('Error marking today completed:', error);
    }
  }

  async isDayCompleted(date: Date): Promise<boolean> {
    try {
      const dateString = date.toDateString();
      const completed = await AsyncStorage.getItem(`dayCompleted_${dateString}`);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking if day completed:', error);
      return false;
    }
  }

  private async updateStreak(): Promise<void> {
    try {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      const lastVisit = await AsyncStorage.getItem('lastVisitDate');
      const currentStreak = await this.getUserStreak();
      
      if (lastVisit === yesterday) {
        // Continuing streak
        await AsyncStorage.setItem('userStreak', (currentStreak + 1).toString());
      } else if (lastVisit !== today) {
        // Starting new streak
        await AsyncStorage.setItem('userStreak', '1');
      }
      
      await AsyncStorage.setItem('lastVisitDate', today);
      await this.updateTotalDays();
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  private async updateTotalDays(): Promise<void> {
    try {
      const totalDays = await AsyncStorage.getItem('totalDays');
      const currentTotal = totalDays ? parseInt(totalDays, 10) : 0;
      await AsyncStorage.setItem('totalDays', (currentTotal + 1).toString());
    } catch (error) {
      console.error('Error updating total days:', error);
    }
  }

  async getProgressStats(): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    weeklyGoal: number;
    completedThisWeek: number;
    weeklyCompletions: boolean[];
  }> {
    try {
      const currentStreak = await this.getUserStreak();
      const longestStreak = await AsyncStorage.getItem('longestStreak');
      const totalDays = await AsyncStorage.getItem('totalDays');
      const { completedThisWeek, weeklyCompletions } = await this.getWeeklyProgress();
      
      // Update longest streak if current is higher
      const longestStreakNum = longestStreak ? parseInt(longestStreak, 10) : 0;
      if (currentStreak > longestStreakNum) {
        await AsyncStorage.setItem('longestStreak', currentStreak.toString());
      }
      
      return {
        currentStreak,
        longestStreak: Math.max(currentStreak, longestStreakNum),
        totalDays: totalDays ? parseInt(totalDays, 10) : 0,
        weeklyGoal: 7,
        completedThisWeek,
        weeklyCompletions,
      };
    } catch (error) {
      console.error('Error getting progress stats:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        weeklyGoal: 7,
        completedThisWeek: 0,
        weeklyCompletions: [false, false, false, false, false, false, false],
      };
    }
  }

  private async getWeeklyProgress(): Promise<{
    completedThisWeek: number;
    weeklyCompletions: boolean[];
  }> {
    try {
      // Get the start of this week (Sunday)
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      
      let completedDays = 0;
      const weeklyCompletions: boolean[] = [];
      
      // Check each day of the week
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(startOfWeek);
        checkDate.setDate(startOfWeek.getDate() + i);
        
        if (checkDate > new Date()) {
          // Future dates are not completed
          weeklyCompletions.push(false);
        } else {
          const isCompleted = await this.isDayCompleted(checkDate);
          weeklyCompletions.push(isCompleted);
          if (isCompleted) {
            completedDays++;
          }
        }
      }
      
      return {
        completedThisWeek: completedDays,
        weeklyCompletions,
      };
    } catch (error) {
      console.error('Error getting weekly progress:', error);
      return {
        completedThisWeek: 0,
        weeklyCompletions: [false, false, false, false, false, false, false],
      };
    }
  }

  // Method to get total affirmation count for debugging
  getTotalAffirmationCount(): number {
    return ALL_AFFIRMATIONS.length;
  }

  // Method to clear recent affirmations (for testing)
  async clearRecentAffirmations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.RECENT_AFFIRMATIONS_KEY);
      console.log('Recent affirmations cleared');
    } catch (error) {
      console.error('Error clearing recent affirmations:', error);
    }
  }
}

export const affirmationsService = new AffirmationsService();
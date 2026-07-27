import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Lesson, LessonResource, LessonModule, GlobalResource, LessonProgressDoc, ProgressStatus } from '../types';

/**
 * Fetch progress document for a specific user and lesson
 */
export async function getUserLessonProgress(
  userId: string,
  lessonId: string
): Promise<LessonProgressDoc | null> {
  if (!userId || !lessonId) return null;
  try {
    const progressRef = doc(db, 'users', userId, 'progress', lessonId);
    const snap = await getDoc(progressRef);
    if (snap.exists()) {
      return snap.data() as LessonProgressDoc;
    }
    return null;
  } catch (err) {
    console.error('Error getting user lesson progress:', err);
    return null;
  }
}

/**
 * Save or update progress document automatically
 */
export async function saveUserLessonProgress(
  userId: string,
  lessonId: string,
  updates: Partial<LessonProgressDoc>
): Promise<void> {
  if (!userId || !lessonId) return;
  try {
    const progressRef = doc(db, 'users', userId, 'progress', lessonId);
    const snap = await getDoc(progressRef);

    const now = new Date().toISOString();
    let initialData: Partial<LessonProgressDoc> = {
      lessonId,
      userId,
      currentQuestion: 1,
      totalQuestions: 5,
      score: 0,
      completedQuestions: 0,
      quizStatus: 'Not Started',
      practiceStatus: 'Not Started',
      startedAt: now,
      updatedAt: now,
      completedAt: null,
      accuracy: 0,
      isCompleted: false,
    };

    if (snap.exists()) {
      initialData = snap.data() as LessonProgressDoc;
    }

    const merged = {
      ...initialData,
      ...updates,
      updatedAt: now,
    };

    await setDoc(progressRef, merged, { merge: true });
  } catch (err) {
    console.error('Error saving user lesson progress:', err);
  }
}

/**
 * Fetch all lesson progress documents for a user
 */
export async function getAllUserLessonProgress(
  userId: string
): Promise<Record<string, LessonProgressDoc>> {
  if (!userId) return {};
  try {
    const progressCol = collection(db, 'users', userId, 'progress');
    const snap = await getDocs(progressCol);
    const map: Record<string, LessonProgressDoc> = {};
    snap.forEach((d) => {
      map[d.id] = d.data() as LessonProgressDoc;
    });
    return map;
  } catch (err) {
    console.error('Error fetching all user progress:', err);
    return {};
  }
}

/**
 * Reset progress for practice or quiz
 */
export async function resetUserLessonProgress(
  userId: string,
  lessonId: string,
  mode: 'practice' | 'quiz' | 'both'
): Promise<void> {
  if (!userId || !lessonId) return;
  try {
    const progressRef = doc(db, 'users', userId, 'progress', lessonId);
    const updates: Partial<LessonProgressDoc> = {};

    if (mode === 'practice' || mode === 'both') {
      updates.practiceStatus = 'Not Started';
      updates.practiceHistory = [];
      updates.practiceCurrentProblem = null;
      updates.practiceStudentAnswer = '';
      updates.practiceAttemptsCount = 1;
    }

    if (mode === 'quiz' || mode === 'both') {
      updates.quizStatus = 'Not Started';
      updates.quizHistory = [];
      updates.quizCurrentQuestionObj = null;
    }

    await setDoc(progressRef, updates, { merge: true });
  } catch (err) {
    console.error('Error resetting lesson progress:', err);
  }
}

import { PYTHON_MODULES } from '../data/pythonLessons';

/**
 * Fetch total students count from 'users' collection
 */
export async function getStudentStats(): Promise<{ totalStudents: number }> {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    let totalStudents = 0;
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.role === 'student' || !data.role) {
        totalStudents++;
      }
    });
    return { totalStudents };
  } catch (err) {
    console.error('Error fetching student stats:', err);
    return { totalStudents: 0 };
  }
}

/**
 * Auto-seed initial python lessons into Firestore if 'lessons' collection is empty
 */
export async function seedInitialLessonsIfEmpty(): Promise<Lesson[]> {
  try {
    const lessonsRef = collection(db, 'lessons');
    const snap = await getDocs(lessonsRef);

    if (!snap.empty) {
      const loaded: Lesson[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        loaded.push({
          id: docSnap.id,
          moduleId: data.moduleId || 'mod-1',
          moduleTitle: data.moduleTitle || 'Module 1',
          title: data.title || '',
          description: data.description || '',
          duration: data.duration || '15 mins',
          difficulty: data.difficulty || 'Beginner',
          theoryMarkdown: data.theoryMarkdown || '',
          exercise: data.exercise || {
            id: `ex-${docSnap.id}`,
            title: 'Exercise',
            instructions: '',
            initialCode: '# Write code here\n',
            hints: [],
          },
          order: typeof data.order === 'number' ? data.order : 0,
          published: data.published !== undefined ? data.published : true,
        });
      });

      // Sort by order or id
      loaded.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return loaded;
    }

    // Collection is empty, seed from PYTHON_MODULES
    console.log('Seeding initial Python lessons into Firestore...');
    const seededLessons: Lesson[] = [];
    let globalOrder = 1;

    for (const mod of PYTHON_MODULES) {
      for (const lesson of mod.lessons) {
        const lessonData: Lesson = {
          ...lesson,
          order: globalOrder++,
          published: true,
        };

        await setDoc(doc(db, 'lessons', lesson.id), {
          id: lesson.id,
          moduleId: lesson.moduleId,
          moduleTitle: lesson.moduleTitle,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          difficulty: lesson.difficulty,
          theoryMarkdown: lesson.theoryMarkdown,
          exercise: lesson.exercise,
          order: lessonData.order,
          published: true,
          createdAt: new Date().toISOString(),
        });

        // Add starter resources for demonstration
        if (lesson.id === 'py-101') {
          await addResourceToLesson(lesson.id, {
            title: 'Official Python Docs - Getting Started',
            url: 'https://docs.python.org/3/tutorial/index.html',
            type: 'Documentation',
          });
          await addResourceToLesson(lesson.id, {
            title: 'Python Beginners Guide',
            url: 'https://www.python.org/about/gettingstarted/',
            type: 'Tutorial',
          });
        }

        seededLessons.push(lessonData);
      }
    }

    return seededLessons;
  } catch (err) {
    console.error('Error seeding or getting lessons:', err);
    // Fallback to local pythonLessons
    return PYTHON_MODULES.flatMap((m) =>
      m.lessons.map((l, idx) => ({ ...l, order: idx + 1, published: true }))
    );
  }
}

/**
 * Fetch all lessons from Firestore (including unpublished for admin, or published-only for student)
 */
export async function getLessonsFromFirestore(onlyPublished = false): Promise<Lesson[]> {
  try {
    const lessonsRef = collection(db, 'lessons');
    const snap = await getDocs(lessonsRef);

    if (snap.empty) {
      return await seedInitialLessonsIfEmpty();
    }

    const lessons: Lesson[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const isPublished = data.published !== undefined ? data.published : true;

      if (!onlyPublished || isPublished) {
        lessons.push({
          id: docSnap.id,
          moduleId: data.moduleId || 'mod-1',
          moduleTitle: data.moduleTitle || 'Module 1',
          title: data.title || '',
          description: data.description || '',
          duration: data.duration || '15 mins',
          difficulty: data.difficulty || 'Beginner',
          theoryMarkdown: data.theoryMarkdown || '',
          exercise: data.exercise || {
            id: `ex-${docSnap.id}`,
            title: 'Exercise',
            instructions: '',
            initialCode: '# Write code here\n',
            hints: [],
          },
          order: typeof data.order === 'number' ? data.order : 0,
          published: isPublished,
        });
      }
    });

    lessons.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return lessons;
  } catch (err) {
    console.error('Error fetching lessons from Firestore:', err);
    return PYTHON_MODULES.flatMap((m) =>
      m.lessons.map((l, idx) => ({ ...l, order: idx + 1, published: true }))
    );
  }
}

/**
 * Create a new lesson in Firestore
 */
export async function createLessonInFirestore(lessonData: Omit<Lesson, 'id'>): Promise<string> {
  const lessonId = `py-${Date.now().toString().slice(-6)}`;
  const newLessonRef = doc(db, 'lessons', lessonId);

  await setDoc(newLessonRef, {
    ...lessonData,
    id: lessonId,
    published: lessonData.published !== undefined ? lessonData.published : true,
    order: lessonData.order ?? 99,
    createdAt: new Date().toISOString(),
  });

  return lessonId;
}

/**
 * Update an existing lesson in Firestore
 */
export async function updateLessonInFirestore(lessonId: string, updates: Partial<Lesson>): Promise<void> {
  const lessonRef = doc(db, 'lessons', lessonId);
  await updateDoc(lessonRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a lesson from Firestore
 */
export async function deleteLessonFromFirestore(lessonId: string): Promise<void> {
  const lessonRef = doc(db, 'lessons', lessonId);
  await deleteDoc(lessonRef);

  // Clean up associated resources
  try {
    const resourcesRef = collection(db, 'lessons', lessonId, 'resources');
    const resSnap = await getDocs(resourcesRef);
    const deletePromises = resSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.error('Error cleaning resources on lesson delete:', err);
  }
}

/**
 * Fetch all resources for a specific lesson
 */
export async function getLessonResources(lessonId: string): Promise<LessonResource[]> {
  try {
    const resourcesRef = collection(db, 'lessons', lessonId, 'resources');
    const snap = await getDocs(resourcesRef);

    const resources: LessonResource[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      resources.push({
        id: docSnap.id,
        lessonId,
        title: data.title || '',
        url: data.url || '',
        type: data.type || 'Documentation',
        createdAt: data.createdAt || '',
      });
    });

    return resources;
  } catch (err) {
    console.error('Error fetching lesson resources:', err);
    return [];
  }
}

/**
 * Add a resource link to a lesson
 */
export async function addResourceToLesson(
  lessonId: string,
  resourceData: Omit<LessonResource, 'id' | 'lessonId'>
): Promise<string> {
  const resourcesRef = collection(db, 'lessons', lessonId, 'resources');
  const newDocRef = await addDoc(resourcesRef, {
    ...resourceData,
    lessonId,
    createdAt: new Date().toISOString(),
  });
  return newDocRef.id;
}

/**
 * Update a resource link
 */
export async function updateLessonResource(
  lessonId: string,
  resourceId: string,
  updates: Partial<LessonResource>
): Promise<void> {
  const resRef = doc(db, 'lessons', lessonId, 'resources', resourceId);
  await updateDoc(resRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a resource link
 */
export async function deleteLessonResource(lessonId: string, resourceId: string): Promise<void> {
  const resRef = doc(db, 'lessons', lessonId, 'resources', resourceId);
  await deleteDoc(resRef);
}

/**
 * Fetch all global programming learning resources from 'resources' collection
 */
export async function getGlobalResources(): Promise<GlobalResource[]> {
  try {
    const resourcesRef = collection(db, 'resources');
    const snap = await getDocs(resourcesRef);

    if (snap.empty) {
      // Seed default resources if empty
      const defaultResources: Omit<GlobalResource, 'id'>[] = [
        {
          title: 'Official Python Documentation',
          description: 'Comprehensive tutorials, standard library references, and language specifications.',
          topic: 'Python Fundamentals',
          url: 'https://docs.python.org/3/',
          createdAt: new Date().toISOString(),
        },
        {
          title: 'Real Python Tutorials',
          description: 'In-depth Python programming guides, code snippets, and best practices.',
          topic: 'Web & Backend',
          url: 'https://realpython.com/',
          createdAt: new Date().toISOString(),
        },
        {
          title: 'Python Data Structures & Algorithms',
          description: 'Interactive guide to lists, dictionaries, trees, and algorithmic complexity.',
          topic: 'Data Structures',
          url: 'https://github.com/gfg-python/dsa',
          createdAt: new Date().toISOString(),
        },
      ];

      const seededList: GlobalResource[] = [];
      for (const res of defaultResources) {
        const docRef = await addDoc(resourcesRef, res);
        seededList.push({ ...res, id: docRef.id });
      }
      return seededList;
    }

    const resources: GlobalResource[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      resources.push({
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        topic: data.topic || 'General Python',
        url: data.url || '',
        createdAt: data.createdAt || '',
      });
    });

    return resources.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching global resources:', err);
    return [];
  }
}

/**
 * Create a new global resource link in 'resources' collection
 */
export async function createGlobalResource(
  data: Omit<GlobalResource, 'id' | 'createdAt'>
): Promise<string> {
  const resourcesRef = collection(db, 'resources');
  const newDoc = await addDoc(resourcesRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return newDoc.id;
}

/**
 * Update an existing global resource link
 */
export async function updateGlobalResource(
  id: string,
  updates: Partial<GlobalResource>
): Promise<void> {
  const resRef = doc(db, 'resources', id);
  await updateDoc(resRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a global resource link
 */
export async function deleteGlobalResource(id: string): Promise<void> {
  const resRef = doc(db, 'resources', id);
  await deleteDoc(resRef);
}

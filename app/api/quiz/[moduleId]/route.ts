import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { moduleId: params.moduleId },
    include: {
      module: { select: { title: true, order: true, icon: true } },
    },
  });

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 });
  }

  // Strip correct answers for client
  const questions = (quiz.questions as any[]).map((q, i) => ({
    index: i,
    question: q.question,
    type: q.type,
    options: q.options,
    // Don't send correct answer to client
  }));

  // Get previous results
  const previousResult = await prisma.quizResult.findFirst({
    where: { userId: session.user.id, moduleId: params.moduleId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    moduleTitle: quiz.module.title,
    moduleOrder: quiz.module.order,
    moduleIcon: quiz.module.icon,
    passMark: quiz.passMark,
    total: questions.length,
    questions,
    previousScore: previousResult?.score ?? null,
    previousPassed: previousResult?.passed ?? null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const { answers } = body; // Array of selected option indices

  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Réponses requises' }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { moduleId: params.moduleId },
  });

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 });
  }

  const questions = quiz.questions as any[];
  let score = 0;
  const results = questions.map((q, i) => {
    const userAnswer = answers[i] ?? -1;
    const isCorrect = userAnswer === q.correct;
    if (isCorrect) score++;
    return {
      question: q.question,
      type: q.type,
      options: q.options,
      userAnswer,
      correct: q.correct,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const passed = score >= quiz.passMark;

  // Save result
  await prisma.quizResult.create({
    data: {
      userId: session.user.id,
      moduleId: params.moduleId,
      score,
      total: questions.length,
      passed,
      answers: results,
    },
  });

  // If passed, mark module as completed and unlock next
  if (passed) {
    // Find the module to get its order
    const currentModule = await prisma.trainingModule.findUnique({
      where: { id: params.moduleId },
      select: { order: true },
    });

    if (currentModule) {
      // Mark current as COMPLETED
      await prisma.trainingProgress.updateMany({
        where: {
          sellerId: session.user.id,
          moduleId: params.moduleId,
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          score: Math.round((score / questions.length) * 100),
        },
      });

      // Unlock next module
      const nextModule = await prisma.trainingModule.findFirst({
        where: { order: currentModule.order + 1 },
      });

      if (nextModule) {
        const existingProgress = await prisma.trainingProgress.findUnique({
          where: {
            sellerId_moduleId: {
              sellerId: session.user.id,
              moduleId: nextModule.id,
            },
          },
        });

        if (!existingProgress || existingProgress.status === 'LOCKED') {
          await prisma.trainingProgress.upsert({
            where: {
              sellerId_moduleId: {
                sellerId: session.user.id,
                moduleId: nextModule.id,
              },
            },
            update: {
              status: 'UNLOCKED',
              unlockedBy: session.user.id,
              unlockedAt: new Date(),
            },
            create: {
              sellerId: session.user.id,
              moduleId: nextModule.id,
              status: 'UNLOCKED',
              unlockedBy: session.user.id,
              unlockedAt: new Date(),
            },
          });
        }
      }
    }
  }

  return NextResponse.json({
    score,
    total: questions.length,
    passed,
    passMark: quiz.passMark,
    results,
  });
}

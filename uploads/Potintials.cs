using System;
using System.Drawing;

namespace Algorithm
{
    public class Potintials
    {
        private const int classCount = 2;

        private const int iterationsCount = 50;

        private int correction;

        public bool Warning { get; set; }

        public Function GetFunction(Point[][] teachingPoints)
        {
            var result = new Function(0, 0, 0, 0);
            correction = 1;
            Warning = false;
            bool nextIteration = true;
            int iterationNumber = 0;
            while (nextIteration && iterationNumber < iterationsCount)
            {
                iterationNumber++;
                nextIteration = DoOneIteration(teachingPoints, ref result);
            }
            if (iterationNumber == iterationsCount) Warning = true;
            return result;
        }

        private bool DoOneIteration(Point[][] teachingPoints, ref Function result)
        {
            bool nextIteration = false;

            if (teachingPoints.Length != classCount) throw new Exception();

            for (int classNumber = 0; classNumber < classCount; classNumber++)
            {
                for (int i = 0; i < teachingPoints[classNumber].Length; i++)
                {
                    result += correction*PartFunction(teachingPoints[classNumber][i]);
                    int index = (i + 1)%teachingPoints[classNumber].Length;
                    int nextClassNumber = index == 0 ? (classNumber + 1)%classCount : classNumber;
                    Point nextPoint = teachingPoints[nextClassNumber][index];
                    correction = GetNewCorrection(nextPoint, result, nextClassNumber);
                    if (correction != 0) nextIteration = true;
                }
            }

            return nextIteration;
        }

        private int GetNewCorrection(Point nextPoint, Function result, int nextClassNumber)
        {
            int functionValue = result.GetValue(nextPoint);
            if (functionValue <= 0 && nextClassNumber == 0)
            {
                return 1;
            }
            if (functionValue > 0 && nextClassNumber == 1)
            {
                return -1;
            }
            return 0;
        }


        private Function PartFunction(Point point)
        {
            return new Function(4*point.X, 4*point.Y, 16*point.X*point.Y, 1);
        }
    }
}
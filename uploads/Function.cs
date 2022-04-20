using System.Drawing;

namespace Algorithm
{
    public class Function
    {
        public Function(int xKoef, int yKoef, int xyKoef, int freeKoef)
        {
            XKoef = xKoef;
            YKoef = yKoef;
            XyKoef = xyKoef;
            FreeKoef = freeKoef;
        }

        public int XKoef { get; set; }
        public int YKoef { get; set; }
        public int XyKoef { get; set; }
        public int FreeKoef { get; set; }


        public int GetValue(Point point)
        {
            return FreeKoef + XKoef*point.X + YKoef*point.Y + XyKoef*point.X*point.Y;
        }

        public double GetY(double x)
        {
            return -(XKoef*x + FreeKoef)/(XyKoef*x + YKoef);
        }

        public override string ToString()
        {
            if (XyKoef != 0)
            {
                return "y=(" + -XKoef + "*x" + (-FreeKoef < 0 ? "" : "+") + -FreeKoef + ")/(" +
                       XyKoef +
                       "*x" + (YKoef < 0 ? "" : "+") + YKoef + ")";
            }
            if (YKoef != 0)
            {
                return "y=" + -(double) XKoef/YKoef + "*x" +
                       (-(double) FreeKoef/YKoef < 0 ? "" : "+") + -(double) FreeKoef/YKoef;
            }
            return "x=" + -(double) FreeKoef/XKoef;
        }

        public static Function operator +(Function first, Function second)
        {
            return new Function(first.XKoef + second.XKoef, first.YKoef + second.YKoef,
                first.XyKoef + second.XyKoef, first.FreeKoef + second.FreeKoef);
        }

        public static Function operator *(int koef, Function function)
        {
            return new Function(koef*function.XKoef, koef*function.YKoef, koef*function.XyKoef,
                koef*function.FreeKoef);
        }
    }
}
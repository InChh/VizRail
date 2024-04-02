module;
export module VizRailCore.Curve;
import VizRailCore.Coordinate;
import VizRailCore.Angle;

export namespace VizRailCore
{
	class CircleCurve
	{
	};

	class TransitionCurve
	{
	};

	class Curve
	{
	public:
		Curve(const bool isRightTurn, const Point2D jd1, const Point2D jd2, const Point2D jd3,
			const double circleCurveRadius,
			const double transitionCurveRadius,
			const double transitionCurveLength);
		~Curve() = default;


	private:
		void CalculateSteeringAngle();

	private:
		bool _isRightTurn;
		Point2D _jd1;
		Point2D _jd2;
		Point2D _jd3;
		double _circleCurveRadius;
		double _transitionCurveRadius;
		double _transitionCurveLength;
		Angle _steeringAngle;
		TransitionCurve _transitionCurve1;
		CircleCurve _circleCurve;
		TransitionCurve _transitionCurve2;
	};

	Angle GetQuadrantAngle(const double dx, const double dy);
}

import VizRailCore.Coordinate;
import VizRailCore.Curve;
import <cmath>;
using namespace VizRailCore;

Curve::Curve(const bool isRightTurn, const Point2D jd1, const Point2D jd2, const Point2D jd3,
             const double circleCurveRadius,
             const double transitionCurveRadius,
             const double transitionCurveLength) :
	_isRightTurn(isRightTurn), _jd1(jd1), _jd2(jd2), _jd3(jd3),
	_circleCurveRadius(circleCurveRadius), _transitionCurveRadius(transitionCurveRadius)
	, _transitionCurveLength(transitionCurveLength)
{
	CalculateSteeringAngle();
}

void Curve::CalculateSteeringAngle()
{
	auto [dx1, dy1] = _jd2 - _jd1;
	auto [dx2, dy2] = _jd3 - _jd2;

	Angle azimuthAngle1 = GetQuadrantAngle(dx1, dy1);
	Angle azimuthAngle2 = GetQuadrantAngle(dx2, dy2);
	_steeringAngle = azimuthAngle2 - azimuthAngle1;
}

Angle GetQuadrantAngle(const double dx, const double dy)
{
	Angle theta = Angle::FromRadian(std::atan2(dy, dx));
	Angle quadrantAngle;
	if (dx > 0 && dy > 0)
	{
		quadrantAngle = theta;
	}
	else if (dx < 0 && dy > 0)
	{
		quadrantAngle = Angle::Pi() - theta;
	}
	else if (dx < 0 && dy < 0)
	{
		quadrantAngle = Angle::Pi() + theta;
	}
	else if (dx > 0 && dy < 0)
	{
		quadrantAngle = Angle::TwoPi() - theta;
	}
	return quadrantAngle;
}

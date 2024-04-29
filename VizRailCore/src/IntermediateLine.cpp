#include "IntermediateLine.h"

#include "Utils.h"

using namespace VizRailCore;

double IntermediateLine::Length() const
{
	auto [dx, dy] = _endPoint - _startPoint;
	return sqrt(dx * dx + dy * dy);
}

Point2D IntermediateLine::MileageToCoordinate(const Mileage& mileage) const
{
	const Mileage li = mileage - _startMileage;
	auto [dx, dy] = _endPoint - _startPoint;

	const double length = Length();

	const double xi = dx * li.Value() / length;
	const double yi = dy * li.Value() / length;

	return {_startPoint.X() + xi, _startPoint.Y() + yi};
}

Angle IntermediateLine::MileageToAzimuthAngle(const Mileage& mileage) const
{
	return GetAzimuthAngle(_startPoint, _endPoint);
}

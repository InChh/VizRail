#include "IntermediateLine.h"

using namespace VizRailCore;

Point2D IntermediateLine::MileageToCoordinate(const Mileage& mileage) const
{
	const Mileage li = mileage - _startMileage;
	auto [dx, dy] = _endPoint - _startPoint;
	const double length = sqrt(dx * dx + dy * dy);

	const double xi = _startPoint.X() + dx * li.Value() / length;
	const double yi = _startPoint.Y() + dy * li.Value() / length;

	return {_startPoint.X() + xi, _startPoint.Y() + yi};
}

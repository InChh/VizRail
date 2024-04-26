#include "Coordinate.h"
#include <cmath>

double VizRailCore::Point2D::Distance(const Point2D& other) const
{
	const double dx = _x - other.X();
	const double dy = _y - other.Y();
	return std::sqrt(dx * dx + dy * dy);
}

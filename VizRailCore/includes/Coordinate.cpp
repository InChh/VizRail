#include "Coordinate.h"
#include <cmath>
#include <limits>


double VizRailCore::Point2D::Distance(const Point2D& other) const
{
	const double dx = _x - other.X();
	const double dy = _y - other.Y();
	return std::sqrt(dx * dx + dy * dy);
}

bool VizRailCore::Point2D::operator==(const Point2D& other) const
{
	const double dx = _x - other.X();
	const double dy = _y - other.Y();
	return std::abs(dx) < std::numeric_limits<double>::epsilon()
		&& std::abs(dy) < std::numeric_limits<double>::epsilon();
}

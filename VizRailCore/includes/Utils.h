#pragma once
#include "Angle.h"
#include "Coordinate.h"

namespace VizRailCore
{
	Angle GetAzimuthAngle(const double dx, const double dy);

	Angle GetAzimuthAngle(const Point2D point1, const Point2D point2);

}

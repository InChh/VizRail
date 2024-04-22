#include "Utils.h"

using namespace VizRailCore;

Angle VizRailCore::GetAzimuthAngle(const double dx, const double dy)
{
	if (std::abs(dx - 0.0) < std::numeric_limits<double>::epsilon())
	{
		if (dy > 0)
		{
			return Angle::Pi() / 2;
		}

		if (dy < 0)
		{
			return Angle::Pi() * 3 / 2;
		}

		throw std::invalid_argument("dx and dy cannot be both zero");
	}

	const Angle theta = Angle::FromRadian(std::atan2(std::abs(dy), std::abs(dx)));
	Angle azimuthAngle;
	if (dx > 0 && dy > 0)
	{
		azimuthAngle = theta;
	}
	else if (dx < 0 && dy > 0)
	{
		azimuthAngle = Angle::Pi() - theta;
	}
	else if (dx > 0 && dy < 0)
	{
		azimuthAngle = Angle::TwoPi() - theta;
	}
	else if (dx < 0 && dy < 0)
	{
		azimuthAngle = Angle::Pi() + theta;
	}
	return azimuthAngle;
}

Angle VizRailCore::GetAzimuthAngle(const Point2D point1, const Point2D point2)
{
	auto [dx, dy] = point2 - point1;
	return GetAzimuthAngle(dx, dy);
}


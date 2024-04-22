#pragma once
#include "Coordinate.h"
#include "Mileage.h"


namespace VizRailCore
{
	class IMileageToCoordinate
	{
	public:
		IMileageToCoordinate() = default;
		virtual ~IMileageToCoordinate() = default;

		virtual bool IsOnIt(const Mileage& mileage) const = 0;

		virtual Point2D MileageToCoordinate(const Mileage& mileage) const = 0;
	};
}

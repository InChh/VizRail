#pragma once
#include "Coordinate.h"
#include "Mileage.h"


namespace VizRailCore
{
	class LineElement
	{
	public:
		LineElement() = default;
		virtual ~LineElement() = default;

		virtual double Length() const = 0;

		virtual bool IsOnIt(const Mileage& mileage) const = 0;

		virtual Point2D MileageToCoordinate(const Mileage& mileage) const = 0;

		virtual Angle MileageToAzimuthAngle(const Mileage& mileage) const = 0;
	};
}

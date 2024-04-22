#pragma once
#include "IMileageToCoordinate.h"

namespace VizRailCore
{
	class IntermediateLine : public IMileageToCoordinate
	{
	public:
		IntermediateLine(const Point2D& startPoint, const Mileage& startMileage, const Point2D& endPoint,
		                 const Mileage& endMileage): _startPoint(startPoint), _startMileage(startMileage),
		                                      _endPoint(endPoint), _endMileage(endMileage)
		{
		}

		[[nodiscard]] Point2D StartPoint() const
		{
			return _startPoint;
		}

		void SetStartPoint(const Point2D& startPoint)
		{
			_startPoint = startPoint;
		}

		[[nodiscard]] Point2D EndPoint() const
		{
			return _endPoint;
		}

		void SetEndPoint(const Point2D& endPoint)
		{
			_endPoint = endPoint;
		}

		bool IsOnIt(const Mileage& mileage) const override
		{
			return mileage > _startMileage && mileage < _endMileage;
		}

		Point2D MileageToCoordinate(const Mileage& mileage) const override;

	private:
		Point2D _startPoint;
		Mileage _startMileage;
		Point2D _endPoint;
		Mileage _endMileage;
	};
}
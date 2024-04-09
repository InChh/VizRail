// ReSharper disable CppInconsistentNaming
#pragma once

#include "Coordinate.h"
#include "Angle.h"

namespace VizRailCore
{
	class CircleCurve
	{
	};

	class TransitionCurve
	{
	};

	class Curve
	{
	public:
		Curve(const Point2D jd1, const Point2D jd2, const Point2D jd3,
		      const double R,
		      const double Ls);

		[[nodiscard]] Angle SteeringAngle() const { return _alpha; }

		[[nodiscard]] double R() const
		{
			return _r;
		}

		[[nodiscard]] double Ls() const
		{
			return _ls;
		}

		[[nodiscard]] Angle Alpha() const
		{
			return _alpha;
		}

		[[nodiscard]] double m() const;

		[[nodiscard]] double P() const;

		[[nodiscard]] Angle beta_0() const;

		[[nodiscard]] double T_H() const;

		[[nodiscard]] double L_H() const;

	private:
		void CalculateSteeringAngle();

		Point2D _jd1;
		Point2D _jd2;
		Point2D _jd3;
		double _r;
		double _ls;
		Angle _alpha;
	};

	Angle GetAzimuthAngle(const double dx, const double dy);
}

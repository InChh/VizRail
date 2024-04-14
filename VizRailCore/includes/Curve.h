// ReSharper disable CppInconsistentNaming
#pragma once

#include "Coordinate.h"
#include "Angle.h"

namespace VizRailCore
{
	/// 曲线类，代表由三个交点确定的带缓和曲线的圆曲线，使用3个交点和曲线半径R、缓和曲线长Ls构造曲线对象后，可计算曲线要素和里程
	class Curve
	{
	public:
		Curve(const Point2D jd1, const Point2D jd2, const Point2D jd3,
		      const double R,
		      const double Ls);

		[[nodiscard]] double R() const
		{
			return _r;
		}

		[[nodiscard]] double Ls() const
		{
			return _ls;
		}

		[[nodiscard]] Angle Alpha() const;

		[[nodiscard]] double m() const;

		[[nodiscard]] double P() const;

		[[nodiscard]] Angle Beta_0() const;

		[[nodiscard]] double T_H() const;

		[[nodiscard]] double L_H() const;

	private:
		Point2D _jd1;
		Point2D _jd2;
		Point2D _jd3;
		double _r;
		double _ls;
	};

	Angle GetAzimuthAngle(const double dx, const double dy);
}

#pragma once

#include <tuple>

namespace VizRailCore
{
	class Point3D
	{
	public:
		Point3D(const double x, const double y, const double z) : _x(x), _y(y), _z(z)
		{
		}

		[[nodiscard]] double X() const
		{
			return _x;
		}

		[[nodiscard]] double Y() const
		{
			return _y;
		}

		[[nodiscard]] double Z() const
		{
			return _z;
		}

	private:
		double _x = 0;
		double _y = 0;
		double _z = 0;
	};

	class Point2D
	{
	public:
		Point2D() = default;

		Point2D(const double x, const double y) : _x(x), _y(y)
		{
		}

		[[nodiscard]] double X() const
		{
			return _x;
		}

		[[nodiscard]] double Y() const
		{
			return _y;
		}

		void SetX(const double x)
		{
			_x = x;
		}

		void SetY(const double y)
		{
			_y = y;
		}

		[[nodiscard]] double Distance(const Point2D& other) const;

		static double Distance(const Point2D& p1, const Point2D& p2)
		{
			return p1.Distance(p2);
		}

		std::tuple<double, double> operator-(const Point2D& other) const
		{
			return {_x - other._x, _y - other._y};
		}

	private:
		double _x = 0;
		double _y = 0;
	};
}

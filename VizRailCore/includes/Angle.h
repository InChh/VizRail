#pragma once

#include <cmath>
#include <numbers>
#include <stdexcept>

namespace VizRailCore
{
	class Angle
	{
	public:
		Angle(): _value(0.0)
		{
		}

		Angle(const Angle& other) : _value(other._value)
		{
		}

		static Angle FromDegree(const double degree)
		{
			return Angle(degree * std::numbers::pi / 180.0);
		}

		static Angle FromRadian(const double radian)
		{
			return Angle(radian);
		}

		static Angle Pi()
		{
			return Angle(std::numbers::pi);
		}

		static Angle Zero()
		{
			return Angle(0.0);
		}

		static Angle HalfPi()
		{
			return Angle(std::numbers::pi / 2.0);
		}

		static Angle QuarterPi()
		{
			return Angle(std::numbers::pi / 4.0);
		}

		static Angle TwoPi()
		{
			return Angle(2.0 * std::numbers::pi);
		}

		[[nodiscard]] double Degree() const
		{
			return _value * 180.0 / std::numbers::pi;
		}

		[[nodiscard]] double Radian() const
		{
			return _value;
		}

		static double Sin(const Angle& angle)
		{
			return std::sin(angle.Radian());
		}

		static double Cos(const Angle& angle)
		{
			return std::cos(angle.Radian());
		}

		static double Tan(const Angle& angle)
		{
			return std::tan(angle.Radian());
		}

		static double Asin(const Angle& angle)
		{
			return std::asin(angle.Radian());
		}

		static double Acos(const Angle& angle)
		{
			return std::acos(angle.Radian());
		}

		static double Atan(const Angle& angle)
		{
			return std::atan(angle.Radian());
		}

		Angle operator+(const Angle& other) const
		{
			return Angle(_value + other._value);
		}

		Angle operator-(const Angle& other) const
		{
			return Angle(_value - other._value);
		}

		Angle operator+(const double& other) const
		{
			return Angle(_value + other);
		}

		Angle operator-(const double& other) const
		{
			return Angle(_value - other);
		}

		Angle operator*(const double& other) const
		{
			return Angle(_value * other);
		}

		Angle operator/(const double& other) const
		{
			if (other == 0.0)
			{
				throw std::invalid_argument("Division by zero");
			}

			return Angle(_value / other);
		}

		bool operator>(const Angle& other) const
		{
			return _value > other._value;
		}

		bool operator<(const Angle& other) const
		{
			return _value < other._value;
		}

	private:
		explicit Angle(const double value) : _value(value)
		{
		}

		double _value; // always radian
	};
}

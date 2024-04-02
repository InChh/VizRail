module;
export module VizRailCore.Angle;
import <cmath>;
import <numbers>;

export namespace VizRailCore
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

		double Degree() const
		{
			return _value * 180.0 / std::numbers::pi;
		}

		double Radian() const
		{
			return _value;
		}

		double Sin() const
		{
			return std::sin(_value);
		}

		double Cos() const
		{
			return std::cos(_value);
		}

		double Tan() const
		{
			return std::tan(_value);
		}

		double Asin() const
		{
			return std::asin(_value);
		}

		double Acos() const
		{
			return std::acos(_value);
		}

		double Atan() const
		{
			return std::atan(_value);
		}

		Angle operator+(const Angle& other) const
		{
			return Angle(_value + other._value);
		}

		Angle operator-(const Angle& other) const
		{
			return Angle(_value - other._value);
		}

	private:
		explicit Angle(const double value) : _value(value)
		{
		}

		double _value; // always radian
	};
}

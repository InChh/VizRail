#pragma once
#include <stdexcept>
#include <string>

namespace VizRailCore
{
	enum class MileageUnit
	{
		Meter,
		Kilometer,
	};

	/// 里程类，用于表示线路里程，内部存储数据以m为单位，可与double类型进行加减运算，默认单位为m
	class Mileage
	{
	public:
		explicit Mileage(const double value, const MileageUnit unit = MileageUnit::Meter,
		                 const std::wstring& prefix = L"DK")
		{
			SetValue(value, unit);
			SetPrefix(prefix);
		}

		void SetValue(const double value, const MileageUnit unit = MileageUnit::Meter)
		{
			if (value < 0.0)
			{
				throw std::invalid_argument("里程值不能为负");
			}

			switch (unit)
			{
			case MileageUnit::Meter:
				_value = value;
				break;
			case MileageUnit::Kilometer:
				_value = value * 1000.0;
				break;
			}

			_value = value;
		}

		[[nodiscard]] double Value() const
		{
			return _value;
		}

		[[nodiscard]] std::wstring Prefix() const
		{
			return _prefix;
		}

		void SetPrefix(const std::wstring& prefix)
		{
			if (prefix.empty())
			{
				throw std::invalid_argument("里程冠号不能为空");
			}

			_prefix = prefix;
		}

		[[nodiscard]] std::wstring GetString() const;

		Mileage operator+(const double value) const
		{
			return Mileage(_value + value, MileageUnit::Meter, _prefix);
		}

		Mileage operator-(const double value) const
		{
			if (value < 0.0)
			{
				throw std::invalid_argument("里程值不能为负");
			}

			if (_value - value < 0.0)
			{
				return Mileage(0.0, MileageUnit::Meter, _prefix);
			}

			return Mileage(_value - value, MileageUnit::Meter, _prefix);
		}

		Mileage operator+(const Mileage& other) const
		{
			return *this + other.Value();
		}

		Mileage operator-(const Mileage& other) const
		{
			return *this - other.Value();
		}

	private:
		double _value = 0.0;
		std::wstring _prefix = L"DK";
	};
}

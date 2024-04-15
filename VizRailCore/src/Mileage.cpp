#include "Mileage.h"
#include <cmath>
#include <format>

using namespace VizRailCore;

void Mileage::SetValue(const double value, const MileageUnit unit)
{
	if (value < 0.0)
	{
		throw std::invalid_argument("Mileage value can not be negative");
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
}

void Mileage::SetValue(const std::wstring& mileageString)
{
	const size_t pos = mileageString.find(L'+');
	if (pos == std::wstring::npos)
	{
		throw std::invalid_argument("Invalid mileage string format");
	}

	const std::wstring prefix = mileageString.substr(0, 2);
	const std::wstring kilometerString = mileageString.substr(2, pos - 2);
	const std::wstring meterString = mileageString.substr(pos + 1);
	const double meterValue = std::stod(meterString);
	const double kilometerValue = std::stod(kilometerString);
	const double value = kilometerValue * 1000.0 + meterValue;
	SetValue(value, MileageUnit::Meter);
	SetPrefix(prefix);
}

std::wstring Mileage::GetString() const
{
	const double kilometer = static_cast<int>(_value / 1000);
	const double meter = _value - kilometer * 1000;
	const std::wstring mileageString = std::format(L"{}{}+{:.6f}", _prefix, kilometer, meter);
	return mileageString;
}

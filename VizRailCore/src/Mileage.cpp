#include "Mileage.h"
#include <cmath>
#include <format>

using namespace VizRailCore;

std::wstring Mileage::GetString() const
{
	const double kilometer = std::fmod(_value, 1000);
	const double meter = _value - kilometer * 1000;
	const std::wstring mileageString = std::format(L"%s%f+%f",_prefix,kilometer,meter);
	return mileageString;
}

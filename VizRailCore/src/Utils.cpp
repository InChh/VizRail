#include "Utils.h"

#include <atlmem.h>

using namespace VizRailCore;

Angle VizRailCore::GetAzimuthAngle(const double dx, const double dy)
{
	if (std::abs(dx - 0.0) < std::numeric_limits<double>::epsilon())
	{
		if (dy > 0)
		{
			return Angle::Pi() / 2;
		}

		if (dy < 0)
		{
			return Angle::Pi() * 3 / 2;
		}

		throw std::invalid_argument("dx and dy cannot be both zero");
	}

	const Angle theta = Angle::FromRadian(std::atan2(std::abs(dy), std::abs(dx)));
	Angle azimuthAngle;
	if (dx > 0 && dy > 0)
	{
		azimuthAngle = theta;
	}
	else if (dx < 0 && dy > 0)
	{
		azimuthAngle = Angle::Pi() - theta;
	}
	else if (dx > 0 && dy < 0)
	{
		azimuthAngle = Angle::TwoPi() - theta;
	}
	else if (dx < 0 && dy < 0)
	{
		azimuthAngle = Angle::Pi() + theta;
	}
	return azimuthAngle;
}

Angle VizRailCore::GetAzimuthAngle(const Point2D point1, const Point2D point2)
{
	auto [dx, dy] = point2 - point1;
	return GetAzimuthAngle(dx, dy);
}

std::wstring VizRailCore::String2Wstring(const std::string& str)
{
	std::wstring result;
	//获取缓冲区大小，并申请空间，缓冲区大小按字符计算  
	const int len = MultiByteToWideChar(CP_ACP, 0, str.c_str(), str.size(), nullptr, 0);
	const auto buffer = new TCHAR[len + 1];
	//多字节编码转换成宽字节编码  
	MultiByteToWideChar(CP_ACP, 0, str.c_str(), str.size(), buffer, len);
	buffer[len] = '\0'; //添加字符串结尾  
	//删除缓冲区并返回值  
	result.append(buffer);
	delete[] buffer;
	return result;
}


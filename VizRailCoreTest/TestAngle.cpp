#include <catch2/catch_approx.hpp>
#include <catch2/catch_test_macros.hpp>
import VizRailCore.Angle;
using namespace VizRailCore;
using namespace Catch;

TEST_CASE("TestAngleCreation","[Angle]")
{
	SECTION("TestAngleFromDegree")
	{
		Angle angle = Angle::FromDegree(90.0);
		REQUIRE(angle.Degree() == 90.0);
		REQUIRE(angle.Radian() == Approx(1.5707963267948966));
	}

	SECTION("TestAngleFromRadian")
	{
		Angle angle = Angle::FromRadian(1.5707963267948966);
		REQUIRE(angle.Degree() == Approx(90.0));
		REQUIRE(angle.Radian() == 1.5707963267948966);
	}

	SECTION("TestAnglePi")
	{
		Angle angle = Angle::Pi();
		REQUIRE(angle.Degree() == Approx(180.0));
		REQUIRE(angle.Radian() == Approx(3.141592653589793));
	}

	SECTION("TestAngleZero")
	{
		Angle angle = Angle::Zero();
		REQUIRE(angle.Degree() == 0.0);
		REQUIRE(angle.Radian() == 0.0);
	}

	SECTION("TestAngleHalfPi")
	{
		Angle angle = Angle::HalfPi();
		REQUIRE(angle.Degree() == Approx(90.0));
		REQUIRE(angle.Radian() == Approx(1.5707963267948966));
	}

	SECTION("TestAngleQuarterPi")
	{
		Angle angle = Angle::QuarterPi();
		REQUIRE(angle.Degree() == Approx(45.0));
		REQUIRE(angle.Radian() == Approx(0.7853981633974483));
	}

	SECTION("TestAngleTwoPi")
	{
		Angle angle = Angle::TwoPi();
		REQUIRE(angle.Degree() == Approx(360.0));
		REQUIRE(angle.Radian() == Approx(6.283185307179586));
	}
}

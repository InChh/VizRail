#include <catch2/catch_test_macros.hpp>
#include <catch2/catch_approx.hpp>

#include "Mileage.h"

using namespace Catch;
using namespace VizRailCore;

TEST_CASE("MileageShouldCreate", "[Mileage]")
{
	const Mileage mileage(100.0, MileageUnit::Meter, L"DK");
	REQUIRE(mileage.Value() == Approx(100.0));
	REQUIRE(mileage.Prefix() == L"DK");

	const Mileage mileage2(2.0, MileageUnit::Kilometer, L"AK");
	REQUIRE(mileage2.Value() == Approx(2000.0));
	REQUIRE(mileage2.Prefix() == L"AK");
}


TEST_CASE("MileageShouldThrowException", "[Mileage]")
{
	REQUIRE_THROWS_AS(Mileage(-1.0, MileageUnit::Meter, L"DK"), std::invalid_argument);
	REQUIRE_THROWS_AS(Mileage(1.0, MileageUnit::Meter, L""), std::invalid_argument);
}

TEST_CASE("MileageShouldSetValue", "[Mileage]")
{
	Mileage mileage(100.0, MileageUnit::Meter, L"DK");
	mileage.SetValue(200.0, MileageUnit::Meter);
	REQUIRE(mileage.Value() == Approx(200.0));

	mileage.SetValue(2.0, MileageUnit::Kilometer);
	REQUIRE(mileage.Value() == Approx(2000.0));
}

TEST_CASE("MileageShouldGetCorrectString","[Mileage]")
{
	const Mileage mileage(100.0, MileageUnit::Meter, L"DK");
	REQUIRE(mileage.GetString() == L"DK0+100.000000");

	const Mileage mileage2(2.0, MileageUnit::Kilometer, L"AK");
	REQUIRE(mileage2.GetString() == L"AK2+0.000000");

	const Mileage mileage3(41.2853, MileageUnit::Kilometer, L"AK");
	REQUIRE(mileage3.GetString() == L"AK41+285.300000");
}

TEST_CASE("MileageShouldComputeCorrect","[Mileage]")
{
	const Mileage mileage(100.0, MileageUnit::Meter, L"DK");
	const Mileage mileage2(200.0, MileageUnit::Meter, L"DK");
	const Mileage mileage3 = mileage + mileage2;
	REQUIRE(mileage3.Value() == Approx(300.0));
	REQUIRE(mileage3.Prefix() == L"DK");

	const Mileage mileage4 = mileage2 - mileage;
	REQUIRE(mileage4.Value() == Approx(100.0));
	REQUIRE(mileage4.Prefix() == L"DK");

	const Mileage mileage5 = mileage2 + 123.1;
	REQUIRE(mileage5.Value() == Approx(323.1));

	const Mileage mileage6 = mileage - 12.2;
	REQUIRE(mileage6.Value() == Approx(87.8));

	const Mileage mileage7 = mileage - 300.0;
	REQUIRE(mileage7.Value() == Approx(0.0));
}

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
	REQUIRE(mileage.GetString() == L"DK0.000000+100.000000");

	const Mileage mileage2(2.0, MileageUnit::Kilometer, L"AK");
	REQUIRE(mileage2.GetString() == L"AK2.000000+0.000000");
}

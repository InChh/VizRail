#include <catch2/catch_session.hpp>

int main(const int argc, char* argv[])
{
	Catch::Session session;
	if (const int returnCode = session.applyCommandLine(argc, argv); returnCode != 0)
		return returnCode;

	return session.run();
}

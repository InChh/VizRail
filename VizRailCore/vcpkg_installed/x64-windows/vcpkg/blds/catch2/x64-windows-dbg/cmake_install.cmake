# Install script for directory: D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/src/v3.4.0-a183b6a984.clean

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/pkgs/catch2_x64-windows/debug")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "Debug")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "OFF")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/cmake/Catch2" TYPE FILE FILES
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/x64-windows-dbg/Catch2Config.cmake"
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/x64-windows-dbg/Catch2ConfigVersion.cmake"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/cmake/Catch2" TYPE FILE FILES
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/src/v3.4.0-a183b6a984.clean/extras/ParseAndAddCatchTests.cmake"
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/src/v3.4.0-a183b6a984.clean/extras/Catch.cmake"
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/src/v3.4.0-a183b6a984.clean/extras/CatchAddTests.cmake"
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/src/v3.4.0-a183b6a984.clean/extras/CatchShardTests.cmake"
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/src/v3.4.0-a183b6a984.clean/extras/CatchShardTestsImpl.cmake"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/Catch2" TYPE FILE FILES
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/src/v3.4.0-a183b6a984.clean/extras/gdbinit"
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/src/v3.4.0-a183b6a984.clean/extras/lldbinit"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/pkgconfig" TYPE FILE FILES
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/x64-windows-dbg/catch2.pc"
    "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/x64-windows-dbg/catch2-with-main.pc"
    )
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for each subdirectory.
  include("D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/x64-windows-dbg/src/cmake_install.cmake")

endif()

if(CMAKE_INSTALL_COMPONENT)
  set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INSTALL_COMPONENT}.txt")
else()
  set(CMAKE_INSTALL_MANIFEST "install_manifest.txt")
endif()

string(REPLACE ";" "\n" CMAKE_INSTALL_MANIFEST_CONTENT
       "${CMAKE_INSTALL_MANIFEST_FILES}")
file(WRITE "D:/Programming/C++/Projects/VizRail/VizRailCore/vcpkg_installed/x64-windows/vcpkg/blds/catch2/x64-windows-dbg/${CMAKE_INSTALL_MANIFEST}"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
